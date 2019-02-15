'use strict';

import { src, dest } from 'gulp';
// 'gulp assets:copy' -- copies the assets into the dist directory, needs to be
// done this way because Jekyll overwrites the whole directory otherwise
export const copyAssets = () => {
  src('.tmp/assets/**/*')
    .pipe(dest('dist/assets'));
};

// 'gulp jekyll:copy' -- copies your processed Jekyll site to the dist directory
export const copySite = () => {
  src('.tmp/dist/**/*')
    .pipe(dest('dist'));
};