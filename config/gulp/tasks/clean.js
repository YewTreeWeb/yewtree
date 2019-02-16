'use strict';

import { task } from 'gulp';
import del from 'del';

task('clean:assets', () => {
  return del(['.tmp/**/*', '!.tmp/assets', '!.tmp/assets/images', '!.tmp/assets/images/**/*', 'dist/assets']);
});
task('clean:images', () => {
  return del(['.tmp/assets/images', 'dist/assets/images']);
});
task('clean:dist', () => {
  return del(['dist/', '.tmp/dist']);
});
task('clean:gzip', () => {
  return del(['dist/**/*.gz']);
});
task('clean:site', () => {
  return del(['.tmp/src']);
});
