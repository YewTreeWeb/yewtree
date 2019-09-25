import { src, dest, watch, series, parallel } from 'gulp'
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
    'gulp-group-css-media-queries': 'gcmq',
    'gulp-sass-glob': 'sassGlob',
    'gulp-rev-replace': 'revReplace',
    'gulp-cloudinary-upload': 'cloudinary',
    'gulp-clean-css': 'cleanCSS',
    'gulp-html-autoprefixer': 'htmlAutoprefixer'
  },
  pattern: ['gulp-*', '*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
})

const sync = browserSync.create()

// Get Gulp configs.
const config = read.sync('./config/gulp.config.yml')

/**
 * Environment
 */
export const env = done => {
  console.log(
    prod ? 'Running Gulp in production' : 'Running Gulp in development'
  )
  done()
}

/**
 * Jekyll
 */

// gulp jekyll runs Jekyll build with development environment
// gulp jekyll --prod runs Jekyll build with production settings
export const jekyll = done => {
  const JEKYLL_ENV = prod ? 'JEKYLL_ENV=production' : ''
  const verbose = config.jekyll.debug ? '--verbose' : ''
  const silent = config.jekyll.silent ? '--quiet' : ''
  const inc = config.jekyll.incremental ? '--incremental' : ''
  const build = !prod
    ? 'jekyll build ' +
      verbose +
      inc +
      ' --config _config.yml, _config.dev.yml' +
      silent
    : 'jekyll build'

  shell.exec(JEKYLL_ENV + 'bundle exec ' + build)
  done()
}

// gulp jekyll_check after production build run tests with html-proofer
export const jekyll_check = done => {
  shell.exec('gulp build --prod')
  shell.exec('bundle exec rake test')
  done()
}

/**
 * Styles
 */
export const sass = () => {
  return src(config.sass.src)
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
        outputStyle: 'expanded',
        onError: sync.notify
      })
    )
    .pipe(
      $.size({
        showFiles: true
      })
    )
    .pipe(
      $.postcss([
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
    .pipe(
      $.cleanCSS({
        level: {
          1: {
            all: true,
            normalizeUrls: false
          },
          2: {
            all: false,
            removeEmpty: true,
            removeDuplicateFontRules: true,
            removeDuplicateMediaBlocks: true,
            removeDuplicateRules: true
          }
        }
      })
    )
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
    .pipe($.if(!prod, sync.stream()))
    .pipe($.if(!prod, dest(config.sass.tmp)))
}

/**
 * Scripts
 */
export const js = () => {
  return src(config.js.src)
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
    vendors.map(dependency => './node_modules/' + dependency + '/**/*.*'),
    {
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
        $.imagemin(
          [
            $.imagemin.jpegtran({
              progressive: true
            }),
            pngquant({
              speed: 1,
              quality: [0.5, 0.5] // lossy settings
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
              plugins: [
                {
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
          ],
          {
            verbose: true
          }
        )
      )
    )
    .pipe(dest(config.image.dest))
    .pipe(
      $.size({
        title: 'images'
      })
    )
    .pipe($.if(!prod, dest('.tmp/images')))
}

/**
 * Convert to .webp
 */
export const webpImg = () => {
  return src(config.image.webp)
    .pipe($.plumber())
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
    .pipe($.if(!prod, dest('.tmp/images')))
}

/**
 * Icons
 */
export const icons = () => {
  return src(config.image.icons)
    .pipe($.plumber())
    .pipe($.svgmin())
    .pipe(
      $.rename({
        prefix: 'icon-'
      })
    )
    .pipe(
      $.svgstore({
        fileName: 'icons.svg',
        inlineSvg: true
      })
    )
    .pipe(
      $.cheerio({
        run: function ($, file) {
          $('svg').attr('style', 'display:none')
          $('[fill]').removeAttr('fill')
        },
        parserOptions: { xmlMode: true }
      })
    )
    .pipe(
      $.size({
        showFiles: true
      })
    )
    .pipe(dest(config.image.dest))
    .pipe($.if(!prod, dest('.tmp/images')))
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
 * HTML Minify
 */
export const html = () => {
  return src('dist/**/*.html')
    .pipe($.plumber())
    .pipe($.htmlAutoprefixer())
    .pipe(
      $.if(
        prod,
        $.htmlmin({
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: false,
          removeAttributeQuotes: false,
          removeRedundantAttributes: false,
          minifyJS: true,
          minifyCSS: true
        })
      )
    )
    .pipe(
      $.if(
        prod,
        $.size({
          title: 'optimized HTML'
        })
      )
    )
    .pipe(dest('dist'))
}

/**
 * Clean
 */
export const clean_dist = () => {
  return del(config.clean.dest)
}
export const clean_tmp = () => {
  return del('.tmp')
}
export const clean_cache = done => {
  $.cache.clearAll()
  done()
}

/**
 * Copy
 */
export const copy = done => {
  src(config.copy.src).pipe(dest(config.copy.dest))
  done()
}
export const copyVendors = done => {
  src(config.copy.vendors.src)
    .pipe($.plumber())
    .pipe($.if('*.css', $.cleanCSS()))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', dest(config.copy.vendors.css)))
    .pipe($.if('*.js', dest(config.copy.vendors.js)))
  done()
}

/**
 * Fonts
 */
export const fonts = done => {
  src(config.fonts.src)
    .pipe($.plumber())
    .pipe(dest(config.fonts.dest))
    .pipe($.if(!prod, dest('.tmp/fonts')))
    .pipe(
      $.size({
        title: 'Fonts completed'
      })
    )
  done()
}

/**
 * Reload browser
 */
export const reload = done => {
  sync.reload()
  done()
}

/**
 * Watch and live reload
 */
export const serve = done => {
  sync.init({
    port: config.browsersync.port,
    ui: {
      port: config.browsersync.port + 1
    },
    server: {
      baseDir: 'dist'
    },
    logLevel: config.browsersync.debug ? 'debug' : '',
    injectChanges: true,
    notify: config.browsersync.notify,
    ghostMode: {
      clicks: config.browsersync.preferences.clicks,
      scroll: config.browsersync.preferences.scroll
    },
    open: config.browsersync.open // Toggle to automatically open page when starting.
  })

  done()

  watch(config.watch.scss)
    .on('add', sass)
    .on('change', sass)
  watch(config.watch.js)
    .on('add', series(js, reload))
    .on('change', series(js, reload))
  watch(config.watch.jekyll)
    .on('add', series(jekyll, copyVendors, copy, reload))
    .on('change', series(jekyll, copyVendors, copy, reload))
  watch(config.watch.fonts)
    .on('add', series(fonts, reload))
    .on('change', series(fonts, reload))
  watch(config.watch.images, series(images, webpImg, reload))
  watch(config.watch.icons, series(icons, reload))
}

/**
 * Deploy
 */
export const deploy = done => {
  const live = prod ? 'netlify deploy --prod' : 'netlify deploy'
  shell.exec(live)
  done()
}

/**
 * Build site
 */
export const build = series(
  env,
  parallel(clean_dist, clean_cache),
  jekyll,
  vendorTask,
  copyVendors,
  parallel(sass, js, images, html, fonts),
  parallel(cloudinary, webpImg),
  deploy
)

/**
 * Default
 */
export const dev = series(
  env,
  clean_dist,
  jekyll,
  copy,
  vendorTask,
  parallel(copyVendors, sass, js, images, fonts),
  parallel(webpImg, icons),
  serve
)

export default dev
