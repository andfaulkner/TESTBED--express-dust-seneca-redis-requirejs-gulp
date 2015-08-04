'use strict';
// TODO gulp-nodemon;
// TODO possibly gulp-develop-server;
// TODO gulp-sourcemaps

/******************************* INCOMPLETE **********************************/
var gulp = require('gulp');

var path = require('path');
var _ = require('lodash');
require('shelljs/global');
var fs = require('fs-extra');
var yargs = require('yargs');

var gutil = require('gulp-util');
var lazypipe = require('lazypipe');
var runSequence = require('run-sequence');

var p = require('gulp-packages')(gulp, [
    'autoprefixer',
    'babel',
    'debug',
    'dev',
    'display-help',
    'exit',
    'if-else',
    'jshint',
    'newer',
    'nodemon',
    'plumber',
    'print',
    'rename',
    'replace',
    'sass',
    'shell',
    'size',
    'stats',
    'webpack',
]);

//pipe components
var catchErrors, consoleTaskReport, newerThanRootIfNotProduction, rmDebugCode;

//command line param handling
var cmds, args;


//Constants
var DEST, SRC;


//Utility functions
var onError;


//------------------ Command line parameter handling ---------------------//
//Command line flags accepted by gulp
cmds = ['test', 'production', 'stats', 'once'];

/** Populate args object w/ command line args, setting each that was received to
  * true in the args object, & all others to false. Referenced by argument name.
  * @example args.production set to true if gulp launched w/ gulp --production.
  */
args = (function populateArgs(argList, argObj){
    argList.forEach(function createArgObjFromArgArray(arg){
        argObj[arg] = (yargs.argv[arg] === true);
    });
    return argObj;
}(cmds, {}));
//------------------------------------------------------------------------//


////------------------------------ Constants -------------------------------//
DEST = {
        root: 'build/',
        www: 'build/www/',
        css: 'build/www/styles/',
        html: 'build/www/html/',
        images: 'build/www/images/',
        resources: 'build/www/res/',
        server: 'build/server/'
};

SRC = {
        root: './',
        webJS: 'content/app-entry.js',
        server: 'src/',
        htmlentry: 'content/index.html',
        scss: 'content/styles/scss/**/*.scss',
        html: 'content/html/**/*.html',
        tasks: 'tasks/',
        webpack: 'tasks/webpack.config.js',
        // webpack_once: 'tasks/webpack.runonce.config.js',
};
//-----------------------------------------------------------------------//


/**
 * Output webpack errors when caught.
 */
onError = function onError(err) {
      gutil.beep();
      console.log('onError');
      console.log(err);
      console.log(err.toString());
      console.log(typeof err);
};

//----------- reusable pipe components -----------//
catchErrors = lazypipe()
    .pipe(p.plumber, { errorHandler: onError });

consoleTaskReport = lazypipe()
    .pipe(catchErrors)
    .pipe(p.print);

newerThanRootIfNotProduction = lazypipe()
    .pipe(p.ifElse, !args.production, p.newer.bind(this, DEST.root));

rmDebugCode = lazypipe()
    .pipe(p.ifElse, !!args.production, p.replace.bind(this,
        /\/\*<\%.*\%\>\*\//g, ''))
    .pipe(p.ifElse, !!args.production, p.replace.bind(this,
        /\/\*<\{\{DEBUG\*\/[\s\S]*?\/\*DEBUG\}\}\>\*\//gm, ''))
    .pipe(p.ifElse, !!args.production, p.replace.bind(this,
        /\/\*<\{\{TEST\*\/[\s\S]*?\/\*TEST\}\}\>\*\//gm, ''));
//------------------------------------------------//



gulp.task('js', function js() {
    return gulp.src(SRC.js)
        .pipe(p.ifElse( !args.production, p.newer.bind(this,
            DEST.js + '/app.js')))
        .pipe(consoleTaskReport())
        .pipe(p.webpack(require(SRC.webpack_once)))
        .pipe(p.rename('app.js'))
        .pipe(p.ifElse( !!args.stats, p.size ))
        .pipe(gulp.dest(DEST.js));
});

gulp.task('default', function(){
    return gulp.src('server.js')
        .pipe(p.babel({
            compact: false
        }))
        .pipe(gulp.dest(DEST.server));
});