'use strict';
const gulp = require('gulp');
const when = require('gulp-if');
const size = require('gulp-size');
const gzip = require('gulp-gzip');
const htmlmin = require('gulp-htmlmin');
const argv = require('yargs').argv;
const $ = require('gulp-load-plugins')({
  rename: {
    'gulp-html-autoprefixer': 'htmlAutoprefixer'
  },
  pattern: ['gulp-*', 'gulp.*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
});

// 'gulp html' -- does nothing
// 'gulp html --prod' -- minifies and gzips our HTML files
gulp.task('html', () =>
  gulp.src('dist/**/*.html')
    .pipe($.plumber())
    .pipe($.htmlAutoprefixer())
    .pipe(when(argv.prod, htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: false,
      removeAttributeQuotes: false,
      removeRedundantAttributes: false,
      minifyJS: true,
      minifyCSS: true
    })))
    .pipe(when(argv.prod, size({title: 'optimized HTML'})))
    .pipe(when(argv.prod, gulp.dest('dist')))
    .pipe(when(argv.prod, gzip({append: true})))
    .pipe(when(argv.prod, size({
      title: 'gzipped HTML',
      gzip: true
    })))
    .pipe(when(argv.prod, gulp.dest('dist')))
);
