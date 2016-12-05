'use strict';
const gulp = require('gulp');

const minifyCSS = require('gulp-minify-css');
const uglify = require('gulp-uglifyjs');
const rename = require('gulp-rename');
const htmlreplace = require('gulp-html-replace');
const del = require('del');


gulp.task('default', function() {
    runSequence(
        'build',
        'clean'
    );
});

gulp.task('build', ['css', 'js'], function () {
    return gulp.src('./index.src.html')
        .pipe(htmlreplace({
            'css': 'css/style.min.css?'+Date.now(),
            'js': 'js/app.min.js?'+Date.now()
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./'));
        // .pipe(function(db){
        //     del(['./.tmp'], {force: true}).then(db);
        // });
});

gulp.task('css',['clean'], function() {
    return gulp.src('./css/*.css')
        .pipe(minifyCSS({keepBreaks: true}))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./css'));
});

gulp.task('js', ['clean'], function() {
    return gulp.src('./js/*.js')
        .pipe(uglify({
            mangle: false,
            output: {
                beautify: false
            }
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./js'));
})

gulp.task('tmp', function() {
    return gulp.src('./src/*')
        .pipe(gulp.dest('./.tmp'));
});

function cleanBuildFn() {
    return del.sync(['./css/*.min.css', './js/*.min.js'], {force: true});
};

gulp.task('clean', cleanBuildFn);