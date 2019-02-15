'use strict';

import fs from 'fs';
import { src, dest } from 'gulp';
import plugins from "gulp-load-plugins";

const $ = plugins({
  pattern: ['gulp-*', '*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
});

// 'gulp deploy' -- reads from your Rsync credentials file and incrementally
// uploads your site to your server
export const upload = () => {
  const credentials = JSON.parse(fs.readFileSync('rsync-credentials.json', 'utf8'));

  return src('dist/**', {dot: true})
    .pipe($.plumber())
    .pipe($.rsync({
      root: 'dist',
      hostname: credentials.hostname,
      username: credentials.username,
      destination: credentials.destination,
      incremental: true
    }));
};

export const cloudinary = () => {
  return src('.tmp/assets/images/*')
    .pipe($.plumber())
    .pipe($.cloudinary({
      config: {
        cloud_name: 'mat-teague',
        api_key: '925148782699291',
        api_secret: '2pdj9N2gyIvWxOquVwb8jf8WyMo'
      }
    }))
    .pipe($.cloudinary.manifest({
      path: './config/cloudinary-manifest.json',
      merge: true
    }))
    .pipe(dest('./config'));
};