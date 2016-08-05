'use strict';

var gulp = require('gulp');
var srcDir = 'src',
    staticDir = 'static',
    assetsDir = 'assets',
    templatesDir = 'templates';

gulp.paths = {
    srcDir: srcDir,
    srcTemplates: srcDir + '/templates',
    src: assetsDir,
    bower: assetsDir + '/bower_components',
    tmp: assetsDir + '/.tmp',
    srcImages: assetsDir + '/images',
    srcSass: assetsDir + '/sass',
    srcCss: assetsDir + '/css',
    srcJs: assetsDir + '/js',
    templates: templatesDir,
    destStatic: staticDir,
    destImages: staticDir + '/resources/images',
    destFonts: templatesDir + '/fonts',
    destCss: templatesDir + '/css',
    destJs: templatesDir + '/js'
};

require('require-dir')('./gulp');

gulp.task('build', ['clean'], function () {
    gulp.start('buildapp');
});
