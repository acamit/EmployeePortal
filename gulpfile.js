(function () {
    'use strict';

    var gulp = require('gulp'),
        jsFiles = ['*.js', 'src/**/*.js'],
        nodemon= require('gulp-nodemon');

    gulp.task('inject', function () {
        var wiredep = require('wiredep').stream,
            inject = require('gulp-inject'),
            options = {
                        bowerJson: require('./bower.json'),
                        directory: './public/lib',
                         ignorePath:'../../public'
                       },
            optionsI = {
                  ignorePath:'/public'
            },
            injectSrc = gulp.src(['./public/css/*.css',
                                    './public/js/*.js'
                ], {read:false});
                       
        return gulp.src('./src/views/*.ejs')
                    .pipe(wiredep(options))
                    .pipe(inject(injectSrc, optionsI))
                    .pipe(gulp.dest('./src/views/'));
    });

    gulp.task('serve', ['inject'], function(){
        var options = {
            script:'index.js',
            delayTime:1,
            env:{
                'PORT':3000
            },
            watch:jsFiles
        }
        return nodemon(options)
                .on('restart', function(ev){
                    console.log('restarting now...');
                });
    });
}());