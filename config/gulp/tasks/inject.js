'use strict';

import { src, dest } from 'gulp';
import plugins from "gulp-load-plugins";

const $ = plugins({
  pattern: ['gulp-*', '*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
});

// 'gulp inject:head' -- injects our style.css file into the head of our HTML
export const injectHead = () => {
  return src('.tmp/src/_includes/head.html')
    .pipe($.plumber())
    .pipe($.inject(src('.tmp/assets/stylesheets/*.css'), {ignorePath: '.tmp'}))
    .pipe(dest('.tmp/src/_includes'));
};

// 'gulp inject:footer' -- injects our index.js file into the end of our HTML
export const injectFooter = () => {
  return src('.tmp/src/_layouts/default.html')
    .pipe($.plumber())
    .pipe($.inject(src('.tmp/assets/js/*.js'), {ignorePath: '.tmp'}))
    .pipe(dest('.tmp/src/_layouts'));
};
