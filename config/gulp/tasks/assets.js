'use strict';
const argv = require('yargs').argv;
const autoprefixer = require('autoprefixer');
const $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'gulp.*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
});
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const gulp = require('gulp');
const gzip = require('gulp-gzip');
const newer = require('gulp-newer');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const sass = require('gulp-sass');
const size = require('gulp-size');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const when = require('gulp-if');
const cssvariables = require('postcss-css-variables');
const calc = require('postcss-calc');
const rucksack = require('rucksack-css');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const webpackConfig = {
  mode: mode,
  entry: {
    main: './' + paths.jsFiles + '/kubix.js'
  },
  output: {
    filename: 'kubix.js'
  },
  module: {
    rules: [{
      loader: 'babel-loader',
      exclude: /node_modules/,
      options: {
        presets: [
          'babel-preset-es2015',
          'babel-preset-react',
          'babel-preset-env'
        ].map(require.resolve)
      }
    }]
  },
  devServer: {
    historyApiFallback: true
  },
  devtool: 'source-map'
};

// 'gulp scripts' -- creates a index.js file from your JavaScript files and
// creates a Sourcemap for it
// 'gulp scripts --prod' -- creates a index.js file from your JavaScript files,
// minifies, gzips and cache busts it. Does not create a Sourcemap
gulp.task('scripts', () =>
  // NOTE: The order here is important since it's concatenated in order from
  // top to bottom, so you want vendor scripts etc on top
  gulp.src('src/assets/javascript/main.js')
  .pipe($.plumber())
  .pipe(newer('.tmp/assets/javascript/main.js', {
    dest: '.tmp/assets/javascript',
    ext: '.js'
  }))
  .pipe(webpackStream(webpackConfig), webpack)
  .pipe(when(!argv.prod, sourcemaps.init({
    loadMaps: true
  })))
  .pipe(size({
    showFiles: true
  }))
  .pipe(when(argv.prod, rename({
    suffix: '.min'
  })))
  .pipe(when(argv.prod, when('*.js', uglify({
    preserveComments: 'some'
  }))))
  .pipe(when(argv.prod, size({
    showFiles: true
  })))
  .pipe(when(argv.prod, rev()))
  .pipe($.if(env.sourcemaps, through.obj(function (file, enc, cb) {
    // Dont pipe through any source map files as it will be handled
    // by gulp-sourcemaps
    const isSourceMap = /\.map$/.test(file.path);
    if (!isSourceMap) this.push(file);
    cb();
  })))
  .pipe(when(!argv.prod, sourcemaps.write('.')))
  .pipe(when(argv.prod, gulp.dest('.tmp/assets/javascript')))
  .pipe(when(argv.prod, when('*.js', gzip({
    append: true
  }))))
  .pipe(when(argv.prod, size({
    gzip: true,
    showFiles: true
  })))
  .pipe(gulp.dest('.tmp/assets/javascript'))
);

gulp.task('vendorScripts', () =>
  // NOTE: The order here is important since it's concatenated in order from
  // top to bottom, so you want vendor scripts etc on top
  gulp.src('src/assets/javascript/vendor.js')
  .pipe($.plumber())
  .pipe(newer('.tmp/assets/javascript/vendors.js', {
    dest: '.tmp/assets/javascript',
    ext: '.js'
  }))
  .pipe(when(!argv.prod, sourcemaps.init()))
  .pipe(concat('vendors.js'))
  .pipe(size({
    showFiles: true
  }))
  .pipe(when(argv.prod, rename({
    suffix: '.min'
  })))
  .pipe(when(argv.prod, when('*.js', uglify({
    preserveComments: 'some'
  }))))
  .pipe(when(argv.prod, size({
    showFiles: true
  })))
  .pipe(when(argv.prod, rev()))
  .pipe(when(!argv.prod, sourcemaps.write('.')))
  .pipe(when(argv.prod, gulp.dest('.tmp/assets/javascript')))
  .pipe(when(argv.prod, when('*.js', gzip({
    append: true
  }))))
  .pipe(when(argv.prod, size({
    gzip: true,
    showFiles: true
  })))
  .pipe(gulp.dest('.tmp/assets/javascript'))
);

// 'gulp styles' -- creates a CSS file from your SASS, adds prefixes and
// creates a Sourcemap
// 'gulp styles --prod' -- creates a CSS file from your SASS, adds prefixes and
// then minwhenies, gzips and cache busts it. Does not create a Sourcemap
gulp.task('styles', () =>
  gulp.src('src/assets/scss/style.scss')
  .pipe($.plumber())
  .pipe(when(!argv.prod, sourcemaps.init()))
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
  .pipe(when(argv.prod, rename({
    suffix: '.min'
  })))
  .pipe(when(argv.prod, when('*.css', cssnano({
    autoprefixer: false
  }))))
  .pipe(when(argv.prod, size({
    showFiles: true
  })))
  .pipe(when(argv.prod, rev()))
  .pipe(when(!argv.prod, sourcemaps.write('.')))
  .pipe(when(argv.prod, gulp.dest('.tmp/assets/stylesheets')))
  .pipe(when(argv.prod, when('*.css', gzip({
    append: true
  }))))
  .pipe(when(argv.prod, size({
    gzip: true,
    showFiles: true
  })))
  .pipe(gulp.dest('.tmp/assets/stylesheets'))
  .pipe(when(!argv.prod, browserSync.stream()))
);

// Function to properly reload your browser
function reload(done) {
  browserSync.reload();
  done();
}
// 'gulp serve' -- open up your website in your browser and watch for changes
// in all your files and update them when needed
gulp.task('serve', (done) => {
  browserSync.init({
    port: env.port, // change port to match default Jekyll
    ui: {
      port: env.port + 1
    },
    server: ['.tmp', 'dist'],
    logFileChanges: (env.debug) ? true : false,
    logLevel: (env.debug) ? 'debug' : '',
    injectChanges: true,
    notify: env.notify,
    open: env.open // Toggle to automatically open page when starting.
  });
  done();

  // Watch various files for changes and do the needful
  gulp.watch(['src/**/*.{md|markdown}', 'src/**/*.html', 'src/**/*.{yml|yaml}', '_config.yml', '_config.dev.yml', '_headers', '_redirects'], gulp.series('build:site', reload));
  gulp.watch(['src/**/*.xml', 'src/**/*.txt'], gulp.series('site', reload));
  gulp.watch(['src/assets/javascript/**/*.js', '! src/assets/javascript/vendors/*.js'], gulp.series('scripts', reload));
  gulp.watch('src/assets/javascript/vendors/*.js', gulp.series('vendorScripts', reload));
  gulp.watch('src/assets/scss/**/*.{scss|sass}', gulp.series('styles'));
  gulp.watch('src/assets/images/**/*', gulp.series('images', 'upload-images-to-cloudinary', reload));
});