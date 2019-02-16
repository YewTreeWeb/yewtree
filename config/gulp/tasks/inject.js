'use strict';

import { task, src, dest } from 'gulp';
import plugins from "gulp-load-plugins";

const $ = plugins({
  pattern: ['gulp-*', '*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
});

// 'gulp inject:head' -- injects our style.css file into the head of our HTML
task('inject:head', () => {
  return src('.tmp/src/_includes/head.html')
    .pipe($.plumber())
    .pipe($.inject(src('.tmp/assets/styles/*.css'), {ignorePath: '.tmp'}))
    .pipe(dest('.tmp/src/_includes'));
});

// 'gulp inject:footer' -- injects our index.js file into the end of our HTML
task('inject:footer', () => {
  return src('.tmp/src/_layouts/default.html')
    .pipe($.plumber())
    .pipe($.inject(src('.tmp/assets/js/*.js'), {ignorePath: '.tmp'}))
    .pipe(dest('.tmp/src/_layouts'));
});
