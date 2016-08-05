'use strict';

var gulp = require('gulp');

gulp.paths = {
    srcDir: 'src',
    srcTemplates: 'src/templates',
    src: 'assets',
    bower: 'assets/bower_components',
    tmp: 'assets/.tmp',
    srcImages: 'assets/images',
    srcSass: 'assets/sass',
    srcCss: 'assets/css',
    srcJs: 'assets/js',
    templates: 'templates',
    destStatic: 'static',
    destImages: 'static/resources/images',
    destFonts: 'templates/fonts',
    destCss: 'templates/css',
    destJs: 'templates/js'
};

require('require-dir')('./gulp');

gulp.task('build', ['clean'], function () {
    gulp.start('buildapp');
});


