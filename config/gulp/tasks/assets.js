'use strict';

import {
  task,
  src,
  dest,
  watch,
  series
} from "gulp";
import fs from "fs";
import through from "through2";
import yargs from "yargs";
import yaml from "js-yaml";
import autoprefixer from "autoprefixer";
import plugins from "gulp-load-plugins";
import browserSync from "browser-sync";
import webpack from 'webpack';
import webpackStream from "webpack-stream";
import named from "vinyl-named";
import cssvariables from "postcss-css-variables";
import calc from "postcss-calc";
import rucksack from "rucksack-css";

import pkg from '../../../package.json';

// Define environment.
const prod = yargs.argv.prod;

// Load Gulp config file.
function loadConfig() {
  const ymlFile = fs.readFileSync('config/gulpconfig.yml', 'utf8');
  return yaml.load(ymlFile);
}
const config = loadConfig();
module.exports = config;

// Load Gulp Plugins
const $ = plugins({
  rename: {
    "gulp-sass-lint": "sassLint",
    "gulp-group-css-media-queries": "gcmq",
    "gulp-sass-glob": "sassGlob",
    "gulp-jpeg-2000": "jp2",
    "gulp-if": "when",
    "gulp-sass-lint": "sassLint"
  },
  pattern: ['gulp-*', '*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
});

// Create BrowserSync Server
const sync = browserSync.create();

// new function added to check if ESLint has run the fix
function isFixed(file) {
  return file.eslint !== null && file.eslint.fixed;
}

// Setup Webpack.
const webpackConfig = {
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      options: {
        presets: [
          '@babel/preset-env',
          'babel-preset-airbnb'
        ]
      }
    }]
  },
  mode: prod ? 'production' : 'development',
  devServer: {
    historyApiFallback: true
  },
  devtool: !prod ? 'inline-source-map' : false,
  output: {
    filename: '[name].js'
  },
  externals: {
    jquery: 'jQuery'
  },
  plugins: [
    // Set jQuery in global scope
    // https://webpack.js.org/plugins/provide-plugin/
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
};

// Call project vendors
const vendors = Object.keys(pkg.dependencies || {});

task('vendor', () => {
  if (vendors.length === 0) {
    return new Promise((resolve) => {
      console.log("No dependencies specified");
      resolve();
    });
  }

  return src(vendors.map(dependency => './node_modules/' + dependency + '/**/*.*'), {
      base: './node_modules/'
    })
    .pipe(
      $.changed("src/assets/vendors", {
        hasChanged: $.changed.compareContents
      })
    )
    .pipe(dest('src/assets/vendors'));
});

// 'gulp scripts' -- creates a index.js file from your JavaScript files and
// creates a Sourcemap for it
// 'gulp scripts --prod' -- creates a index.js file from your JavaScript files,
// minifies, gzips and cache busts it. Does not create a Sourcemap
task('scripts', (done) => {
  // NOTE: The order here is important since it's concatenated in order from
  // top to bottom, so you want vendor scripts etc on top
  src('src/assets/js/main.js')
    .pipe($.plumber())
    .pipe(named())
    .pipe($.newer('.tmp/assets/js/main.js', {
      dest: '.tmp/assets/js',
      ext: '.js'
    }))
    .pipe($.when(!prod, $.eslint({
      fix: true,
    })))
    .pipe($.when(!prod, $.eslint.format()))
    // if running fix - replace existing file with fixed one
    .pipe($.when(!prod, $.when(isFixed, dest('src/assets/js'))))
    .pipe($.when(!prod, $.eslint.failAfterError()))
    .pipe(webpackStream(webpackConfig), webpack)
    .pipe($.when(!prod, $.sourcemaps.init({
      loadMaps: true
    })))
    .pipe($.size({
      showFiles: true
    }))
    .pipe($.when(prod, $.rename({
      suffix: '.min'
    })))
    .pipe($.when(prod, $.when('*.js', $.uglify({
      preserveComments: 'some'
    }))))
    .pipe($.when(prod, $.size({
      showFiles: true
    })))
    .pipe($.when(prod, $.rev()))
    .pipe($.when($.sourcemaps, through.obj(function (file, enc, cb) {
      // Dont pipe through any source map files as it will be handled
      // by gulp-sourcemaps
      const isSourceMap = /\.map$/.test(file.path);
      if (!isSourceMap) this.push(file);
      cb();
    })))
    .pipe($.when(!prod, $.sourcemaps.write('.')))
    .pipe($.when(prod, $.rev.manifest('js-manifest.json')))
    .pipe($.when(prod, dest('.tmp/assets/js')))
    .pipe($.when(prod, $.when('*.js', $.gzip({
      append: true
    }))))
    .pipe($.when(prod, $.size({
      gzip: true,
      showFiles: true
    })))
    .pipe(dest('.tmp/assets/js'));
  done();
});

// 'gulp styles' -- creates a CSS file from your SASS, adds prefixes and
// creates a Sourcemap
// 'gulp styles --prod' -- creates a CSS file from your SASS, adds prefixes and
// then min$.whenies, gzips and cache busts it. Does not create a Sourcemap
task('styles', (done) => {
  src('src/assets/scss/style.scss')
    .pipe($.plumber())
    .pipe($.when(!prod, $.sourcemaps.init()))
    .pipe($.cssimport({
      matchPattern: "*.css"
    }))
    .pipe($.sassGlob())
    .pipe($.sass({
      precision: 10,
      outputStyle: 'expanded'
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      rucksack({
        fallbacks: true
      }),
      autoprefixer({
        browsers: [
          'last 15 versions',
          '>1%',
          'ie >= 11',
          'ie_mob >= 10',
          'firefox >= 30',
          'Firefox ESR',
          'chrome >= 34',
          'safari >= 7',
          'opera >= 23',
          'ios >= 9',
          'android >= 4.4',
          'bb >= 10'
        ],
        grid: true,
        cascade: false
      }),
      cssvariables({
        preserve: true
      }),
      calc()
    ]))
    .pipe($.size({
      showFiles: true
    }))
    .pipe($.when(prod, $.rename({
      suffix: '.min'
    })))
    .pipe($.gcmq())
    .pipe($.csscomb())
    .pipe($.when(prod, $.when('*.css', $.cssnano({
      autoprefixer: false
    }))))
    .pipe($.when(prod, $.size({
      showFiles: true
    })))
    .pipe($.when(prod, $.rev()))
    .pipe($.when(!prod, $.sourcemaps.write('.')))
    .pipe($.when(prod, $.rev.manifest('css-manifest.json')))
    .pipe($.when(prod, dest('.tmp/assets/styles')))
    .pipe($.when(prod, $.when('*.css', $.gzip({
      append: true
    }))))
    .pipe($.when(prod, $.size({
      gzip: true,
      showFiles: true
    })))
    .pipe(dest('.tmp/assets/styles'))
    .pipe($.when(!prod, sync.stream()));
  done();
});

// Function to properly reload your browser
function reload(done) {
  sync.reload();
  done();
}
// 'gulp serve' -- open up your website in your browser and watch for changes
// in all your files and update them $.when needed
task('serve', (done) => {
  sync.init({
    port: config.browsersync.port, // change port to match default Jekyll
    ui: {
      port: config.browsersync.port + 1
    },
    server: ['.tmp', 'dist'],
    logFileChanges: config.browsersync.debug ? true : false,
    logLevel: config.browsersync.debug ? 'debug' : '',
    injectChanges: true,
    notify: config.browsersync.notify,
    open: config.browsersync.open // Toggle to automatically open page $.when starting.
  });
  done();

  // Watch various files for changes and do the needful
  watch(['src/**/*.+(md|markdown)', 'src/**/*.html', 'src/**/*.+(yml|yaml)', '_config.yml', '_config.dev.yml', '_headers', '_redirects'], series('build:site', reload));
  watch(['src/**/*.xml', 'src/**/*.txt'], series('site', reload));
  watch('src/assets/js/**/*.js').on('add', series('scripts', reload)).on('change', series('scripts', reload));
  watch('src/assets/scss/**/*.+(scss|sass)').on('add', series('styles')).on('change', series('styles'));
  // watch('src/assets/images/**/*', series('images', 'upload-images-to-cloudinary', reload));
  watch('src/assets/images/**/*').on('add', series('images', 'cloudinary', reload)).on('change', series('images', 'cloudinary', reload));
  watch('./node_modules/').on('add', series('vendor', reload)).on('change', series('vendor', reload));
});
