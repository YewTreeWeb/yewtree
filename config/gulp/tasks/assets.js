'use strict';

import { src, dest, watch } from "gulp";
import fs from "fs";
import through from "through2";
import yargs from "yargs";
import yaml from "js-yaml";
import autoprefixer from "autoprefixer";
import plugins from "gulp-load-plugins";
import browserSync from "browser-sync";
import del from "del";
import webpack from "webpack-stream";
import named from "vinyl-named";
import cssvariables from "postcss-css-variables";
import calc from "postcss-calc";
import rucksack from "rucksack-css";

import pkg from './package.json';

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
  pattern: ['gulp-*', 'gulp.*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
});

// Create BrowserSync Server
const server = browserSync.create();

// Setup Webpack.
const webpackConfig = {
  mode: prod ? 'production' : 'development',
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      options: {
        presets: [
          'babel-preset-es2015',
          'babel-preset-env',
          'babel-preset-airbnb'
        ].map(require.resolve)
      }
    }]
  },
  output: {
    filename: '[name].js'
  },
  devServer: {
    historyApiFallback: true
  },
  devtool: !prod ? 'inline-source-map' : false,
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

gulp.task('vendor', () => {
  if (vendors.length === 0) {
    return new Promise((resolve) => {
      console.log("No dependencies specified");
      resolve();
    });
  }

  return gulp.src(vendors.map(dependency => node_modules_folder + dependency + '/**/*.*'), { base: node_modules_folder })
    .pipe(gulp.dest(dist_node_modules_folder))
    .pipe(browserSync.stream());
});

// 'gulp scripts' -- creates a index.js file from your JavaScript files and
// creates a Sourcemap for it
// 'gulp scripts --prod' -- creates a index.js file from your JavaScript files,
// minifies, gzips and cache busts it. Does not create a Sourcemap
gulp.task('scripts', () =>
  // NOTE: The order here is important since it's concatenated in order from
  // top to bottom, so you want vendor scripts etc on top
  gulp.src('src/assets/js/main.js')
  .pipe($.plumber())
  .pipe(newer('.tmp/assets/js/main.js', {
    dest: '.tmp/assets/js',
    ext: '.js'
  }))
  .pipe(webpackStream(webpackConfig))
  .pipe(when(!prod, sourcemaps.init({
    loadMaps: true
  })))
  .pipe(size({
    showFiles: true
  }))
  .pipe(when(prod, rename({
    suffix: '.min'
  })))
  .pipe(when(prod, when('*.js', uglify({
    preserveComments: 'some'
  }))))
  .pipe(when(prod, size({
    showFiles: true
  })))
  .pipe(when(prod, rev()))
  .pipe(when(sourcemaps, through.obj(function (file, enc, cb) {
    // Dont pipe through any source map files as it will be handled
    // by gulp-sourcemaps
    const isSourceMap = /\.map$/.test(file.path);
    if (!isSourceMap) this.push(file);
    cb();
  })))
  .pipe(when(!prod, sourcemaps.write('.')))
  .pipe(when(prod, gulp.dest('.tmp/assets/js')))
  .pipe(when(prod, when('*.js', gzip({
    append: true
  }))))
  .pipe(when(prod, size({
    gzip: true,
    showFiles: true
  })))
  .pipe(gulp.dest('.tmp/assets/js'))
);

// 'gulp styles' -- creates a CSS file from your SASS, adds prefixes and
// creates a Sourcemap
// 'gulp styles --prod' -- creates a CSS file from your SASS, adds prefixes and
// then minwhenies, gzips and cache busts it. Does not create a Sourcemap
gulp.task('styles', () =>
  gulp.src('src/assets/scss/style.scss')
  .pipe($.plumber())
  .pipe(when(!prod, sourcemaps.init()))
  .pipe($.cssimport({
    matchPattern: "*.css"
  }))
  .pipe($.sassGlob())
  .pipe(sass({
    precision: 10,
    outputStyle: 'expanded'
  }).on('error', sass.logError))
  .pipe(postcss([
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
  .pipe(size({
    showFiles: true
  }))
  .pipe(when(prod, rename({
    suffix: '.min'
  })))
  .pipe(when(prod, when('*.css', cssnano({
    autoprefixer: false
  }))))
  .pipe(when(prod, size({
    showFiles: true
  })))
  .pipe(when(prod, rev()))
  .pipe(when(!prod, sourcemaps.write('.')))
  .pipe(when(prod, gulp.dest('.tmp/assets/stylesheets')))
  .pipe(when(prod, when('*.css', gzip({
    append: true
  }))))
  .pipe(when(prod, size({
    gzip: true,
    showFiles: true
  })))
  .pipe(gulp.dest('.tmp/assets/stylesheets'))
  .pipe(when(!prod, browserSync.stream()))
);

// Build modernizr from the modernizr-config.json
gulp.task('modernizr', (done) => {

  let buildModernizr = false;
  if (buildModernizr === false) {
    modernizr.build(modernizrConfig, (code) => {
      let buildModernizr = true;
      fs.writeFile(`src/assets/js/modernizr-${pkg.devDependencies.modernizr}.min.js`, code, done);
    });
  }

});

// Function to properly reload your browser
function reload(done) {
  browserSync.reload();
  done();
}
// 'gulp serve' -- open up your website in your browser and watch for changes
// in all your files and update them when needed
gulp.task('serve', (done) => {
  browserSync.init({
    port: config.browsersync.port, // change port to match default Jekyll
    ui: {
      port: config.browsersync.port + 1
    },
    server: ['.tmp', 'dist'],
    logFileChanges: config.browsersync.debug ? true : false,
    logLevel: config.browsersync.debug ? 'debug' : '',
    injectChanges: true,
    notify: config.browsersync.notify,
    open: config.browsersync.open // Toggle to automatically open page when starting.
  });
  done();

  // Watch various files for changes and do the needful
  gulp.watch(['src/**/*.+(md|markdown)', 'src/**/*.html', 'src/**/*.+(yml|yaml)', '_config.yml', '_config.dev.yml', '_headers', '_redirects'], gulp.series('build:site', reload));
  gulp.watch(['src/**/*.xml', 'src/**/*.txt'], gulp.series('site', reload));
  gulp.watch(['src/assets/js/**/*.js', '! src/assets/js/vendors/*.js']).on('add', gulp.series('scripts', reload)).on('change', gulp.series('scripts', reload));
  gulp.watch('src/assets/scss/**/*.+(scss|sass)').on('add', gulp.series('styles')).on('change', gulp.series('styles'));
  // gulp.watch('src/assets/images/**/*', gulp.series('images', 'upload-images-to-cloudinary', reload));
  gulp.watch('src/assets/images/**/*').on('add', gulp.series('images', 'upload-images-to-cloudinary', reload)).on('change', gulp.series('images', 'upload-images-to-cloudinary', reload));
});