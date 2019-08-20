import {
  src,
  dest,
  watch,
  series,
  parallel
} from 'gulp'
import autoprefixer from 'autoprefixer'
import rucksack from 'rucksack-css'
import cssvariables from 'postcss-css-variables'
import calc from 'postcss-calc'
import webpack from 'webpack'
import webpackStream from 'webpack-stream'
import named from 'vinyl-named'
import browserSync from 'browser-sync'
import plugins from 'gulp-load-plugins'
import del from 'del'
import read from 'read-yaml'
import shell from 'shelljs'
import pngquant from 'imagemin-pngquant'
import zopfli from 'imagemin-zopfli'
import giflossy from 'imagemin-giflossy'
import mozjpeg from 'imagemin-mozjpeg'
import webp from 'imagemin-webp'
import extReplace from 'gulp-ext-replace'
import pkg from './package.json'
import yargs from 'yargs'
import webpackConfig from './config/webpack.config.js'

const prod = yargs.argv.prod

const $ = plugins({
  rename: {
    //  'gulp-shopify-theme': 'shopifytheme',
    'gulp-group-css-media-queries': 'gcmq',
    'gulp-sass-glob': 'sassGlob',
    'gulp-minify-css': 'minifycss',
    'gulp-shopify-upload': 'gulpShopify',
    'gulp-rev-replace': 'revReplace',
    'gulp-rev-delete-original': 'revDel',
    'gulp-cloudinary-upload': 'cloudinary',
    'gulp-clean-css': 'cleanCSS'
  },
  pattern: ['gulp-*', '*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
})

const sync = browserSync.create()
const stream = sync.stream()

// Get Gulp configs.
const config = read.sync('./config/gulp.config.yml')

/**
 * Jekyll
 */

// gulp jekyll runs Jekyll build with development environment
// gulp jekyll --prod runs Jekyll build with production settings
export const jekyll = done => {
  const JEKYLL_ENV = prod ? 'JEKYLL_ENV=production' : ''
  const build = !prod ?
    'jekyll build --verbose --config _config.yml, _config.dev.yml' :
    'jekyll build'

  shell.exec(JEKYLL_ENV + 'bundle exec ' + build)
  done()
}

// gulp jekyll_check after production build run tests with html-proofer
export const jekyll_check = done => {
  shell.exec('bundle exec rake test')
  done()
}

/**
 * Styles
 */
export const sass = done => {
  src(config.sass.src)
    .pipe($.plumber())
    .pipe($.if(!prod, $.sourcemaps.init())) // Start sourcemap.
    .pipe(
      $.cssimport({
        matchPattern: '*.css'
      })
    )
    .pipe($.sassGlob())
    .pipe(
      $.sass({
        precision: 10,
        outputStyle: 'expanded'
      })
    )
    .pipe(
      $.size({
        showFiles: true
      })
    )
    .pipe(
      $.postcss([
        cssnext(),
        rucksack({
          fallbacks: true
        }),
        autoprefixer({
          grid: true,
          cascade: false
        })
      ])
    )
    .pipe($.gcmq())
    .pipe($.csscomb())
    .pipe($.cleanCSS())
    .pipe($.postcss([cssvariables(), calc()]))
    .pipe($.if(prod, $.minifycss()))
    .pipe(
      $.if(
        prod,
        $.size({
          title: 'Minified CSS',
          showFiles: true
        })
      )
    )
    .pipe(dest(config.sass.dest))
    .pipe($.if(!prod, stream))
    .pipe($.if(!prod, dest(config.sass.tmp)))
  done()
}

/**
 * Scripts
 */
export const js = done => {
  src(config.js.src)
    .pipe($.plumber())
    .pipe(named())
    .pipe(
      webpackStream(webpackConfig),
      webpack
    )
    .pipe(
      $.size({
        showFiles: true
      })
    )
    .pipe($.if(prod, $.uglify()))
    .pipe(
      $.if(
        prod,
        $.rename({
          suffix: '.min'
        })
      )
    )
    .pipe(
      $.size({
        title: 'Minified JS',
        showFiles: true
      })
    )
    .pipe(dest(config.js.dest))
    .pipe($.if(!prod, dest(config.js.tmp)))
  done()
}

/**
 * Vendors
 */
const vendors = Object.keys(pkg.dependencies || {})

export const vendorTask = () => {
  if (vendors.length === 0) {
    return new Promise(resolve => {
      console.log(config.vendors.notification)
      resolve()
    })
  }

  return src(
    vendors.map(dependency => './node_modules/' + dependency + '/**/*.*'), {
      base: './node_modules/'
    }
  ).pipe(dest(config.vendors.dest))
}

/**
 * Images
 */
export const images = () => {
  return src(config.image.src)
    .pipe($.plumber())
    .pipe($.changed(config.image.dest))
    .pipe(
      $.cache(
        $.imagemin([
          $.imagemin.jpegtran({
            progressive: true,
          }),
          pngquant({
            speed: 1,
            quality: 98 // lossy settings
          }),
          zopfli({
            more: true
          }),
          giflossy({
            optimizationLevel: 3,
            optimize: 3, // keep-empty: Preserve empty transparent frames
            lossy: 2
          }),
          $.imagemin.svgo({
            plugins: [{
                removeViewBox: true
              },
              {
                cleanupIDs: true
              }
            ]
          }),
          mozjpeg({
            quality: 90
          })
        ])
      )
    )
    .pipe(dest(config.image.dest))
    .pipe(
      $.size({
        title: 'images'
      })
    )
}

/**
 * Convert to .webp
 */
export const webp = () => {
  return src(config.image.webp)
    .pipe($.plumber())
    .pipe($.changed(config.image.dest))
    .pipe(
      $.cache(
        $.imagemin([
          webp({
            quality: 75
          })
        ])
      )
    )
    .pipe(extReplace('.webp'))
    .pipe(
      $.size({
        title: 'Coverted to webp'
      })
    )
    .pipe(dest(config.image.dest))
}

/**
 * Cloudinary
 */
export const cloudinary = () => {
  return src(config.cloudinary.src)
    .pipe($.plumber())
    .pipe(
      $.if(
        prod,
        $.cloudinary({
          config: {
            cloud_name: config.cloudinary.account.name,
            api_key: config.cloudinary.account.key,
            api_secret: config.cloudinary.account.secret
          }
        })
      )
    )
    .pipe(
      $.if(
        prod,
        $.cloudinary.manifest({
          path: config.cloudinary.manifest,
          merge: true
        })
      )
    )
    .pipe(dest(config.cloudinary.dest))
}

/**
 * Reload browser
 */
export const reload = done => {
  sync.reload()
  done()
}
