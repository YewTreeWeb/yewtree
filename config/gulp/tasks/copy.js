'use strict';

import { task, src, dest } from 'gulp';
// 'gulp assets:copy' -- copies the assets into the dist directory, needs to be
// done this way because Jekyll overwrites the whole directory otherwise
task('copy:assets', () => {
  return src('.tmp/assets/**/*')
    .pipe(dest('dist/assets'));
});

// 'gulp jekyll:copy' -- copies your processed Jekyll site to the dist directory
task('copy:site', () => {
  return src('.tmp/dist/**/*')
    .pipe(dest('dist'));
});