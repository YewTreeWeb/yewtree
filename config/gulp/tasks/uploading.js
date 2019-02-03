'use strict';
import fs from 'fs';
import gulp from 'gulp';
import rsync from 'gulp-rsync';
import cloudinary from 'gulp-cloudinary-upload';

// 'gulp deploy' -- reads from your Rsync credentials file and incrementally
// uploads your site to your server
gulp.task('upload', () => {
  var credentials = JSON.parse(fs.readFileSync('rsync-credentials.json', 'utf8'));

  return gulp.src('dist/**', {dot: true})
    .pipe(rsync({
      root: 'dist',
      hostname: credentials.hostname,
      username: credentials.username,
      destination: credentials.destination,
      incremental: true
    }));
});

gulp.task('upload-images-to-cloudinary', () => {
  gulp.src('.tmp/assets/images/*')
    .pipe(cloudinary({
      config: {
        cloud_name: 'mat-teague',
        api_key: '925148782699291',
        api_secret: '2pdj9N2gyIvWxOquVwb8jf8WyMo'
      }
    }))
    .pipe(cloudinary.manifest({
      path: '.tmp/src/_config/cloudinary-manifest.json',
      merge: true
    }))
    .pipe(gulp.dest('.tmp/src/_config'));
});