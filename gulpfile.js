'use strict';

const gulp = require('gulp');
const merge = require('merge-stream');

gulp.task('copy', () => {
    const html = gulp.src(['src/**/*.html']).pipe(gulp.dest('./dist'));

    const css = gulp.src(['node_modules/semantic-ui-css/semantic.min.css']).pipe(gulp.dest('./dist'));
    const icons = gulp.src(['node_modules/semantic-ui-css/themes/default/assets/fonts/*']).pipe(gulp.dest('./dist/themes/default/assets/fonts'));

    const images = gulp.src(['src/images/**/*']).pipe(gulp.dest('./dist/images'));

    return merge(html, css);
});

gulp.task('default', () => {
    gulp.watch(['src/**/*.html', 'src/images/*'], ['copy']);
});
