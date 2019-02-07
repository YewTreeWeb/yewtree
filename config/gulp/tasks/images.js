'use strict';
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const size = require('gulp-size');
const replace = require('gulp-replace');
const $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'gulp.*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
});

// 'gulp images' -- optimizes and caches your images
gulp.task('images', () =>
  gulp.src('src/assets/images/**/*')
  .pipe($.plumber())
  .pipe(cache(imagemin([
    imagemin.gifsicle({
      interlaced: true
    }),
    imagemin.jpegtran({
      progressive: true
    }),
    imagemin.optipng(),
    imagemin.svgo({
      plugins: [{
        cleanupIDs: false
      }]
    })
  ])))
  .pipe(gulp.dest('.tmp/assets/images'))
  .pipe(size({
    title: 'images'
  }))
);

gulp.task("use-cloudinary-images", () => {
  const cloudinaryURL = "https://res.cloudinary.com/mat-teague/image/upload/c_scale,dpr_auto,f_auto,w_auto/v1549232522/";

  // replaces paths in build with cloudinary path
  return gulp.src(".tmp/dist/**/*.{html,css}")
    .pipe($.plumber())
    .pipe(replace(/\/?img\//g, function (match) {
      return "/img/";
    }))
    .pipe(gulp.dest(".tmp/dist"));
});
