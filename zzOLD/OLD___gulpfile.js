var gulp = require('gulp');

//Node modules & JS libraries
var path = require('path');
var fs = require('fs-extra');
var yargs = require('yargs');
var merge = require('merge2');
var _ = require('lodash');
require('shelljs/global');

//Gulp plugin list - all available under p.nameOfPackage
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
    'rimraf',
    'sass',
    'shell',
    'size',
    'stats',
    'webpack',
]);

//Atypical Gulp plugins
var gutil = require('gulp-util');
var lazypipe = require('lazypipe');
var runSequence = require('run-sequence');

//pipe components
var catchErrors, consoleTaskReport, newerThanRootIfNotProduction, rmDebugCode;

//command line param handling
var cmds, args;

//Utility functions
var onError;

//Constants
var PATHS, DEST, SRC;


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


//----------------------- Utilities -----------------------//
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
//---------------------------------------------------------//


//------------------------------ Constants -------------------------------//
PATHS = require('./config/project-paths.json');
DEST = PATHS.SRC;
SRC = PATHS.DEST;
//-----------------------------------------------------------------------//


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



gulp.task('mkJsBin', function(){
    gulp.src(DEST.bin + 'www.js')
        .pipe(consoleTaskReport())
        .pipe(p.rename('www'))
        .pipe(gulp.dest(DEST.bin));
    return gulp.src(DEST.bin + 'www.js')
        .pipe(p.rimraf({ force: true }));
});


gulp.task('jsBuild', function(){
    var jsFileOps = [
        {src: SRC.bin + 'www', dest: DEST.bin },
        {src: SRC.middlewares + '**/*.js', dest: DEST.middlewares },
        {src: SRC.client_js + '**/*.js', dest: DEST.client_js },
        {src: SRC.helpers + '**/*.js', dest: DEST.helpers },
        {src: SRC.routes + '**/*.js', dest: DEST.routes }
    ];

    return merge(jsFileOps.map(function(file){
        return gulp.src(file.src)
            .pipe(consoleTaskReport())
            .pipe(p.babel({
                compact: false
             }))
            .pipe(p.dev("got here!"))
            .pipe(gulp.dest(file.dest));
    }));
});



gulp.task('copy', function(){
    var jsCopyPaths = [
        {src: SRC.images + '*.*', dest: DEST.images },
        {src: SRC.favicon, dest: DEST.favicon }
    ];
    return merge(jsCopyPaths.map(function(file){
        return gulp.src(file.src)
            .pipe(consoleTaskReport())
            .pipe(p.debug({title: 'images : '}))
            .pipe(p.ifElse( !!args.stats, p.size ))
            .pipe(gulp.dest(file.dest));
    }));
});

//****************************** STYLES ******************************//
/**
 * Compile SCSS to CSS, output to build directory
 */
gulp.task('sass', function sass() {
    return gulp.src([SRC.styles + '**/*.sass'], [SRC.styles + '***/*.scss'])
        .pipe(consoleTaskReport())
        .pipe(p.sass({errLogToConsole: true}))
        .pipe(p.ifElse( !!args.stats, p.size ))
        .pipe(gulp.dest(DEST.styles));
});
//********************************************************************//

gulp.task('watch', function(){
    gulp.watch(SRC.root + '**/*.*', ['build']);
});

gulp.task('build', function(){
    runSequence(['sass', 'copy', 'jsBuild'], 'mkJsBin');
});

gulp.task('default', function(){
    runSequence('build', 'watch');
});