'use strict';

import { task, src, dest } from 'gulp';
import size from 'gulp-size';

// 'gulp fonts' -- copies your fonts to the temporary assets directory
task('fonts', (done) => {
  src('src/assets/fonts/**/*')
    .pipe(dest('.tmp/assets/fonts'))
    .pipe(size({title: 'fonts'}));
    done();
});
