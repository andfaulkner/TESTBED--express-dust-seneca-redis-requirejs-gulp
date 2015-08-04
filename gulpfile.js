var gulp = require('gulp');

var path = require('path');
var _ = require('lodash');
require('shelljs/global');
var fs = require('fs-extra');
var yargs = require('yargs');
var merge = require('merge2');

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
        root: './',
        bin: './bin/',
        middlewares: './middlewares/',
        public: './public/',
        client_js: './public/javascripts/',
        css: './public/stylesheets/',
        images: './public/images/',
        routes: './routes/',
        views: './views/'
};

SRC = {
        root: './_src/',
        bin: './_src/bin/',
        middlewares: './_src/middlewares/',
        public: './_src/public/',
        client_js: './_src/public/javascripts/',
        css: '/_src/public/stylesheets/',
        images: './_src/_public/images/',
        routes: './_src/routes/',
        views: './_src/views/'
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

var buildJS = function buildJS(src, dest){
    console.log("entered buildJS");
    console.log(gulp.src);
    return gulp.src(src)
        .pipe(consoleTaskReport())
        .pipe(p.babel({
            compact: false
        }))
        .pipe(p.dev("got here!"))
        .pipe(dest);
};

gulp.task('default', function(){
    var files = [
        {src: SRC.bin + 'www', dest: DEST.bin + 'www' },
        {src: SRC.middlewares + '**/*.js', dest: DEST.middlewares + '**/*.js' },
        {src: SRC.routes + '**/*.js', dest: DEST.routes + '**/*.js' }
    ];

    var allJsOps = files.map(function(file){
        return gulp.src(file.src)
            .pipe(consoleTaskReport())
            .pipe(p.babel({
                compact: false
             }))
            .pipe(p.dev("got here!"))
            .pipe(file.dest);
    });
    return merge(allJsOps);
    // files.forEach(function(file){
    //     console.log(buildJS);
    //     return buildJS(file.src, file.dest);
    // }.bind(this));
});

// gulp.task('default', function(){
//     return gulp.src(
//             //SRC.root + '**/*.js',
//             SRC.root + 'bin/www'
//         )
//         .pipe(p.babel({
//         compact: false
//         }))
//         .pipe(gulp.dest(DEST.root));
// });