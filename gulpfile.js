const gulp = require('gulp');
const path = require('path');
const webpack = require('gulp-webpack');

gulp.task('build', () => gulp.src('./lib/index.ts')
  .pipe(webpack(require('./webpack.config')))
  .pipe(gulp.dest('dist'))
);

gulp.task('watch', () => gulp.src('./lib/index.ts')
  .pipe(webpack(Object.assign(require('./webpack.config'), { watch: true })))
  .pipe(gulp.dest('dist'))
);