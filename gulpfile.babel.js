// generated on 2019-02-03 using generator-jekyllized 1.0.0-rc.8
'use strict';

import { series, parallel } from 'gulp';

import requireDir from 'require-dir';
const tasks = requireDir('./config/gulp/tasks', {recurse: true}); // eslint-disable-line

// 'gulp inject' -- injects your CSS and JS into either the header or the footer
export const inject = () => parallel(injectHead, injectFooter);

// 'gulp build:site' -- copies, builds, and then copies it again
export const buildSite = () => series(siteTmp, inject, site, copySite);

// 'gulp assets' -- cleans out your assets and rebuilds them
// 'gulp assets --prod' -- cleans out your assets and rebuilds them with
// production settings
export const assets = () => series(parallel(vendor, styles, scripts, fonts, useCloudinary), series(copyAssets))

// 'gulp clean' -- erases your assets and gzipped files
export const clean = () => parallel(cleanAssets, cleanGzip, cleanDist, cleanSite);

// 'gulp build' -- same as 'gulp' but doesn't serve your site in your browser
// 'gulp build --prod' -- same as above but with production settings
export const build = () => series(clean, assets, buildSite, html);

// You can also just use 'gulp upload' but this way you can see all the main
// tasks in the gulpfile instead of having to hunt for the deploy tasks
export const deploy = () => series(upload);

// 'gulp rebuild' -- WARNING: Erases your assets and built site, use only when
// you need to do a complete rebuild
export const rebuild = () => series(clean, cleanImages);

// 'gulp check' -- checks your site configuration for errors and lint your JS
export const check = () => series(siteCheck);

// 'gulp' -- cleans your assets and gzipped files, creates your assets and
// injects them into the templates, then builds your site, copied the assets
// into their directory and serves the site
// 'gulp --prod' -- same as above but with production settings
export default series(build, serve);