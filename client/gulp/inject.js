'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;

gulp.task('inject', ['styles'], function () {

    var injectStyles = gulp.src([
        paths.tmp + '/serve/templates/**/*.css'
        //'!' + paths.tmp + '/serve/app/vendor.css'
    ], {read: false});

    var injectScripts = gulp.src([
        paths.srcJs + '/**/*.js',
        '!' + paths.src + '/app/**/*.spec.js',
        '!' + paths.src + '/app/**/*.mock.js'
    ]).pipe($.angularFilesort());

    var injectOptions = {
        ignorePath: [paths.src, paths.tmp + '/serve'],
        addRootSlash: false
    };

    var wiredepOptions = {
        directory: 'assets/bower_components',
        exclude: [/bootstrap\.css/, /foundation\.css/]
    };

    return gulp.src(paths.srcTemplates + '/*.html')
        .pipe($.inject(injectStyles, injectOptions))
        .pipe($.inject(injectScripts, injectOptions))
        .pipe(wiredep(wiredepOptions))
        .pipe(gulp.dest(paths.tmp + '/serve/templates'));

});
