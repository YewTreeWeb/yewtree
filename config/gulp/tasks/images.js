'use strict';

import { src, dest } from 'gulp';
import plugins from "gulp-load-plugins";

const $ = plugins({
  pattern: ['gulp-*', '*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
});

// 'gulp images' -- optimizes and caches your images
export const images = () => {
  return src('src/assets/images/**/*')
  .pipe($.plumber())
  .pipe($.cache($.imagemin([
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
  ], {verbose: true})))
  .pipe(dest('.tmp/assets/images'))
  .pipe($.size({
    title: 'images'
  }));
};

export const useCloudinary = () => {
  const cloudinaryURL = "https://res.cloudinary.com/mat-teague/image/upload/c_scale,dpr_auto,f_auto,w_auto/v1549232522/";

  // replaces paths in build with cloudinary path
  return src(".tmp/dist/**/*.{html,css}")
    .pipe($.plumber())
    .pipe($.replace(/\/?img\//g, function (match) {
      return "/img/";
    }))
    .pipe(dest(".tmp/dist"));
};
