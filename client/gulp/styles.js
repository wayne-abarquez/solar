'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();

gulp.task('sass', function () {
    return gulp.src(paths.srcSass + '/app.scss')
        .pipe($.sass({style: 'expanded'}))
        .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']}))
        .on('error', function handleError(err) {
            console.error(err.toString());
            this.emit('end');
        })
        .pipe($.csso())
        .pipe($.rename('app.min.css'))
        //.pipe($.rev())
        //.pipe($.revReplace())
        //.pipe(gulp.dest(paths.tmp + '/serve/templates/css/'));
        .pipe(gulp.dest(paths.destCss + '/'));
});

gulp.task('vendor-css', function () {
   return gulp.src([
       paths.bower + '/font-awesome/css/font-awesome.min.css',
       paths.bower + '/angular-material/angular-material.min.css',
       paths.bower + '/material-design-iconic-font/dist/css/material-design-iconic-font.min.css',
       paths.bower + '/sweetalert/dist/sweetalert.css',
       paths.bower + '/angular-treasure-overlay-spinner/dist/treasure-overlay-spinner.min.css',
       paths.bower + '/ng-inline-edit/dist/ng-inline-edit.min.css',
       paths.bower + '/angular-bootstrap-colorpicker/css/colorpicker.min.css',
       paths.bower + '/angular-material-data-table/dist/md-data-table.min.css'
   ])
       .pipe($.concatCss('vendor.min.css'))
       .pipe($.csso())
       //.pipe($.rev())
       //.pipe($.revReplace())
       //.pipe(gulp.dest(paths.tmp + '/serve/templates/css/'));
       .pipe(gulp.dest(paths.destCss + '/'));
});


//gulp.task('styles', function () {
//
//    var sassOptions = {
//        style: 'expanded'
//    };
//
//    var injectFiles = gulp.src([
//        paths.srcSass + '/app.scss',
//        '!' + paths.srcSass + '/**/_*.scss'
//    ], {read: false});
//
//    var injectOptions = {
//        transform: function (filePath) {
//            filePath = filePath.replace(paths.templates + '/', '');
//            return '@import \'' + filePath + '\';';
//        },
//        starttag: '// injector',
//        endtag: '// endinjector',
//        addRootSlash: false
//    };
//
//    var indexFilter = $.filter(paths.srcSass + '/app.scss', {
//        restore: true
//    });
//
//    return gulp.src([
//        paths.srcSass + '/app.scss'
//    ])
//        //.pipe(indexFilter)
//        .pipe($.inject(injectFiles, injectOptions))
//        //.pipe(indexFilter.restore())
//        .pipe($.sass(sassOptions))
//        .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']}))
//        .on('error', function handleError(err) {
//            console.error(err.toString());
//            this.emit('end');
//        })
//        .pipe(gulp.dest(paths.tmp + '/serve/templates/css'));
//});


gulp.task('styles', ['sass', 'vendor-css']);
