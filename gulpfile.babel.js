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
const stream = browserSync.stream

// Get Gulp configs.
const config = read.sync('./config/gulp.config.yml')

/**
 * Jekyll
 */

// gulp jekyll runs Jekyll build with development environment
// gulp jekyll --prod runs Jekyll build with production settings
export const jekyll = done => {
  const JEKYLL_ENV = prod ? 'JEKYLL_ENV=production' : ''
  const build = !prod
    ? 'jekyll build --verbose --config _config.yml, _config.dev.yml'
    : 'jekyll build'

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
  .pipe(webpackStream(webpackConfig), webpack)
  .pipe(dest(config.js.dest))
  .pipe($.if(!prod, dest(config.js.tmp)))
  done()
}

/**
 * Reload browser
 */
export const reload = done => {
  browserSync.reload()
  done()
}
