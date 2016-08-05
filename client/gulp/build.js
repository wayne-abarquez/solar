'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'del']
});

//gulp.task('html', ['inject'], function () {
//
//    //var htmlFilter = $.filter(['*.html', '!/src/app/elements/examples/*.html']);
//    var jsFilter = $.filter('templates/**/*.js');
//    var cssFilter = $.filter('templates/**/*.css');
//    var assets;
//
//    return gulp.src(paths.tmp + '/serve/templates/*.html')
//        .pipe(assets = $.useref.assets())
//        .pipe($.rev())
//        .pipe(jsFilter)
//        .pipe($.ngAnnotate())
//        .pipe($.uglify())
//        //.pipe(jsFilter.restore())
//        .pipe(cssFilter)
//        .pipe($.csso())
//        //.pipe(cssFilter.restore())
//        .pipe(assets.restore())
//        .pipe($.replace('../bower_components/material-design-iconic-font/fonts', '../fonts'))
//        //.pipe($.replace('../font/weathericons-regular', '../fonts/weathericons-regular'))
//        .pipe($.useref())
//        .pipe($.revReplace())
//        .pipe(gulp.dest(paths.templates + '/'))
//        .pipe($.size({title: paths.templates + '/', showFiles: true}));
//});


gulp.task('images', function () {
    return gulp.src(paths.srcImages + '/**/*')
        .pipe(gulp.dest(paths.destImages + '/'));
});

gulp.task('copy-fonts', function () {
    return gulp.src(paths.bower + '/Materialize/font/roboto/*.*')
        .pipe(gulp.dest(paths.destStatic + '/resources/fonts/Materialize/font/roboto/'));
    //return gulp.src(paths.bower + '/Materialize/font/**/*')
    //    .pipe(gulp.dest(paths.destStatic + '/resources/fonts/Materialize/font/'));
});

gulp.task('fonts', ['copy-fonts'], function () {
    return gulp.src(paths.bower + '/**/*')
        .pipe($.filter('**/*.{eot,otf,ttf,woff,woff2}'))
        .pipe($.flatten())
        .pipe(gulp.dest(paths.destFonts + '/'));
});

gulp.task('clean', function (done) {
    $.del(
        [
            paths.destImages + '/',
            paths.destFonts  + '/',
            paths.destCss    + '/',
            paths.destJs     + '/',
            paths.tmp        + '/'
        ]
        , done);
});

gulp.task('buildapp', ['styles', 'scripts', 'images', 'fonts']);