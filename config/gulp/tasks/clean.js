'use strict';

import gulp from 'gulp';
import del from 'del';

export const cleanAssets = () => {
  return del(['.tmp/**/*', '!.tmp/assets', '!.tmp/assets/images', '!.tmp/assets/images/**/*', 'dist/assets']);
};
export const cleanImages = () => {
  return del(['.tmp/assets/images', 'dist/assets/images']);
};
export const cleanDist = () => {
  return del(['dist/', '.tmp/dist']);
};
export const cleanGzip = () => {
  return del(['dist/**/*.gz']);
};
export const cleanSite = () => {
  return del(['.tmp/src']);
};
