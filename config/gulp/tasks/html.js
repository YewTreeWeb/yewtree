'use strict';

import { src, dest } from 'gulp';
import plugins from "gulp-load-plugins";
import yargs from 'yargs';

const prod = yargs.argv.prod;

const $ = plugins({
  rename: {
    "gulp-if": "when"
  },
  pattern: ['gulp-*', '*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
});

// 'gulp html' -- does nothing
// 'gulp html --prod' -- minifies and gzips our HTML files
export const html = () => {
  return src('dist/**/*.html')
    .pipe($.plumber())
    .pipe($.htmlAutoprefixer())
    .pipe($.when(prod, htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: false,
      removeAttributeQuotes: false,
      removeRedundantAttributes: false,
      minifyJS: true,
      minifyCSS: true
    })))
    .pipe($.when(prod, $.size({title: 'optimized HTML'})))
    .pipe($.when(prod, dest('dist')))
    .pipe($.when(prod, $.gzip({append: true})))
    .pipe($.when(prod, $.size({
      title: 'gzipped HTML',
      gzip: true
    })))
    .pipe($.when(prod, dest('dist')))
};
