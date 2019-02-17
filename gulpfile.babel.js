// generated on 2019-02-03 using generator-jekyllized 1.0.0-rc.8
'use strict';

import {
  task,
  series,
  parallel
} from 'gulp';

import requireDir from 'require-dir';
const tasks = requireDir('./config/gulp/tasks', {
  recurse: true
}); // eslint-disable-line

// 'gulp inject' -- injects your CSS and JS into either the header or the footer
task('inject', parallel('inject:head', 'inject:footer'));

// 'gulp build:site' -- copies, builds, and then copies it again
task('build:site', series('site:tmp', 'inject', 'site', 'copy:site'));

// 'gulp assets' -- cleans out your assets and rebuilds them
// 'gulp assets --prod' -- cleans out your assets and rebuilds them with
// production settings
task('assets', series('vendor', parallel('styles', 'scripts', 'fonts', 'images', 'cloudinary:use'), series('copy:assets')));

// 'gulp clean' -- erases your assets and gzipped files
task('clean', parallel('clean:assets', 'clean:gzip', 'clean:dist', 'clean:site'));

// 'gulp build' -- same as 'gulp' but doesn't serve your site in your browser
// 'gulp build --prod' -- same as above but with production settings
task('build', series('clean', 'assets', 'build:site', 'html'));

// You can also just use 'gulp upload' but this way you can see all the main
// tasks in the gulpfile instead of having to hunt for the deploy tasks
task('deploy', series('upload'));

// 'gulp rebuild' -- WARNING: Erases your assets and built site, use only when
// you need to do a complete rebuild
task('rebuild', series('clean', 'clean:images'));

// 'gulp check' -- checks your site configuration for errors and lint your JS
task('check', series('site:check'));

// 'gulp' -- cleans your assets and gzipped files, creates your assets and
// injects them into the templates, then builds your site, copied the assets
// into their directory and serves the site
// 'gulp --prod' -- same as above but with production settings
task('default', series('build', 'serve'));
