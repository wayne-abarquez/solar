'use strict';

var path = require('path'),
    gulp = require('gulp'),
    args = require('yargs').argv;

var paths = gulp.paths,
    $ = require('gulp-load-plugins')();

gulp.task('vendor-scripts', function () {
    return gulp.src([
        paths.bower + '/jquery/dist/jquery.min.js',
        paths.srcJs + '/promise-6.1.0.min.js',
        paths.bower + '/underscore/underscore-min.js',
        paths.bower + '/angular/angular.min.js',
        paths.bower + '/angular-animate/angular-animate.min.js',
        paths.bower + '/angular-aria/angular-aria.min.js',
        paths.bower + '/angular-cookies/angular-cookies.min.js',
        paths.bower + '/angular-material/angular-material.js',
        paths.bower + '/Blob/Blob.js',
        paths.bower + '/canvas-toBlob.js/canvas-toBlob.js',
        paths.srcJs + '/FileSaver.min.js',
        paths.srcJs + '/html2canvas.js',
        paths.bower + '/ng-file-upload/ng-file-upload-shim.min.js',
        paths.bower + '/ng-file-upload/ng-file-upload.min.js',
        paths.bower + '/sweetalert/dist/sweetalert.min.js',
        paths.bower + '/ngSweetAlert/SweetAlert.min.js',
        paths.bower + '/restangular/dist/restangular.min.js',
        paths.bower + '/angular-treasure-overlay-spinner/dist/treasure-overlay-spinner.min.js',
        paths.bower + '/ng-inline-edit/dist/ng-inline-edit.min.js',
        paths.bower + '/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js',
        paths.bower + '/angular-material-data-table/dist/md-data-table.min.js',
        paths.srcJs + '/infobox.js',
        paths.srcJs + '/custom-infowindow.js',
        paths.srcJs + '/mercator-projection.js'
    ])
        .pipe($.concat('vendor.min.js'))
        .pipe($.uglify({mangle: false}).on('error', $.util.log))
        .pipe(gulp.dest(paths.destJs + '/'))
        .pipe($.size());
});

gulp.task('jq-scripts', function () {
   return gulp.src(paths.srcTemplates + '/js/app_jq.js')
       .pipe($.eslint())
       .pipe($.eslint.format())
       .pipe($.concat('app-jq.min.js'))
       .pipe($.uglify())
       .pipe(gulp.dest(paths.destJs + '/'))
       .pipe($.size());
});

gulp.task('app-scripts', function () {
    return gulp.src([
            '!' + paths.srcTemplates + '/js/app_jq.js',
            paths.srcTemplates + '/js/*.js',
            paths.srcTemplates + '/js/app/**/*.js'
        ])
        .pipe($.plumber())
        .pipe($.eslint())
        .pipe($.eslint.format())
        // Brick on failure to be super strict
        .pipe($.eslint.failOnError())
        .pipe($.ngAnnotate())
        .pipe($.angularFilesort())
        .pipe($.concat('app.min.js'))
        .pipe($.if(args.production, $.uglify()))
        //.pipe($.if(args.production, $.jsObfuscator()))
        .pipe(gulp.dest(paths.destJs + '/'))
        .pipe($.size());
});

gulp.task('scripts', ['vendor-scripts', 'app-scripts']);
