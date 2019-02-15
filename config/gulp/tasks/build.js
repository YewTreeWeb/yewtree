'use strict';

import { src, dest } from 'gulp';
import shell from 'shelljs';
import plugins from "gulp-load-plugins";
import yargs from 'yargs';

const prod = yargs.argv.prod;

const $ = plugins({
  pattern: ['gulp-*', '*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
});

// 'gulp jekyll:tmp' -- copies your Jekyll site to a temporary directory
// to be processed
export const siteTmp = () => {
  src(['src/**/*', '!src/assets/**/*', '!src/assets'], {dot: true})
    .pipe(dest('.tmp/src'))
    .pipe($.size({title: 'Jekyll'}))
}

// 'gulp jekyll' -- builds your site with development settings
// 'gulp jekyll --prod' -- builds your site with production settings
export const site = (done) => {
  if (!prod) {
    shell.exec('bundle exec jekyll build --config _config.yml,_config.dev.yml --verbose --incremental');
    done();
  } else if (prod) {
    shell.exec('bundle exec jekyll build');
    done();
  }
};

// 'gulp doctor' -- literally just runs jekyll doctor
export const siteCheck = (done) => {
  shell.exec('jekyll doctor');
  done();
};
