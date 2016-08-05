'use strict';

var path = require('path');
var gulp = require('gulp');
var paths = gulp.paths;

var browserSync = require('browser-sync');
var runSequence = require('run-sequence');

browserSync({
    notify: true,
    proxy: "127.0.0.1:81"
});

gulp.task('watch', function(event) {
    // Watch HTML Files
    gulp.watch(paths.templates + '/**/*.html',
        function (event) {
            browserSync.reload(event.path);
        });

    // Watch App JS Files
    gulp.watch([
        paths.srcTemplates + '/js/*.js',
        paths.srcTemplates + '/js/app/**/*.js'
    ], function(event) {
        runSequence('app-scripts', function () {
            browserSync.reload(event.path);
        });
    })

    // Watch Sass Files
    gulp.watch(paths.srcSass + '/**/*.scss',
        function (event) {
            runSequence('sass', function () {
                browserSync.reload(event.path);
            });
    });
});