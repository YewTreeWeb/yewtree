'use strict';

import { src, dest } from 'gulp';
import size from 'gulp-size';

// 'gulp fonts' -- copies your fonts to the temporary assets directory
export const fonts = () => {
  src('src/assets/fonts/**/*')
    .pipe(dest('.tmp/assets/fonts'))
    .pipe(size({title: 'fonts'}));
};
