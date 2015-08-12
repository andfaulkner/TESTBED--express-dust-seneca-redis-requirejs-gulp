var gulp = require('gulp');

//NODE MODULES & JS LIBRARIES
var path    = require('path'),
    fs      = require('fs-extra'),
    yargs   = require('yargs'),
    merge   = require('merge2'),
    _       = require('lodash'),
    del     = require('del');

require('shelljs/global');

//ECMA 6 POLYFILL
require('babel/register');
Object.getPrototypeOf.toString = function() {return Object.toString();};


//PIPE COMPONENTS
var catchErrors, consoleTaskReport, newerThanRootIfNotProduction, rmDebugCode;

//COMMAND LINE PARAM HANDLING
var cmds, args;

//UTILITY FUNCTIONS
var onError, resolveSrcAndDest;

//------------------------------- PLUGINS --------------------------------//
//PACKAGED GULP PLUGINS --- AVAILABLE VIA 'p.nameOfPackage'
var p = require('gulp-packages')(gulp, [
    'autoprefixer',             // prefix css for multiple browsers
    'babel',                    // compile ECMA6 --> ECMA5
    'debug',                    // lists all files run thru it
    'dev',                      // Toggle html comments on & off
    'display-help',
    'dust',
    'express',
    'exit',
    'if-else',
    'jshint',
    'newer',
    'livereload',
    'nodemon',
    'notify',
    'plumber',
    'print',
    'rename',
    'replace',
    'rimraf',
    'sass',
    'shell',
    'size',
    'stats',
    'tap',
    'webpack',
]);

//GULP PLUGINS
var gutil = require('gulp-util');
var lazypipe = require('lazypipe');
var runSequence = require('run-sequence');
var livereload = require('gulp-livereload');
var notify = require('gulp-notify');
var wait = require('gulp-wait');
//------------------------------------------------------------------------//


//------------------------------ CONSTANTS -------------------------------//
var PATHS = require('./config/project-paths.json');
var SRC = path.join(__dirname, PATHS.srcdir),
    DEST = path.join(__dirname, PATHS.destdir);
//-----------------------------------------------------------------------//


//------------------ COMMAND LINE PARAMETER HANDLING ---------------------//
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


//------------------------------ UTILITIES ------------------------------//
/**
 * Output webpack errors when caught.
 */
onError = function onError(err) {
    gutil.beep();
    console.log(gutil.colors.red.bgWhite("-----------------------------------"));
    console.log('ERROR OCCURRED');
    console.log(typeof err);
    console.log(gutil.colors.red.bgWhite(err));
    console.log(gutil.colors.red.bgWhite("-----------------------------------"));
    this.emit('end');
};


/**
 * Based on a relative path to resource (or resources), emits an object
 * containing the full absolute paths (& glob) to the source files/dirs
 * (outObj.src) & destination dir (outObj.dest).
 *
 * @param {String} fPath: file or dir path. Assumes dir if it ends w '/'
 *           path is relative to root source & build paths. For dirs,
 *           values like "bin/" or "public/images/" expected; for files
 *           values like "app.js" or "public/favicon.ico" expected.
 * @return {Object<String,String>} property 'src' holds path to source
 *         dir or file; property dest contains path to destination dir
 */
resolveSrcAndDest = function resolveSrcAndDest(fPath, opts) {
    opts = opts || {};

    //Handles param pointing to a directory
    if (_.last(fPath.split('')) === '/') {
        return({
            src: path.join(SRC, fPath) + '**/*.' +
                           ((!!opts.ext) ? opts.ext : '*'),
            dest: path.join(DEST, fPath)
        });
    }

    //Handles param pointing to a file
    let destdir = fPath.match(/[a-zA-z\/]+(?=\/)\//mig);
    return ({
        src: path.join(SRC, fPath),
        dest: (_.isArray(destdir)) ? path.join(DEST, destdir.join('')) : DEST
    });
};
//-----------------------------------------------------------------------//


//------------------------ REUSABLE PIPE COMPONENTS ------------------------//
catchErrors = lazypipe()
    .pipe(p.plumber, { errorHandler: onError });

consoleTaskReport = lazypipe()
    .pipe(catchErrors)
    .pipe(p.print);

newerThanRootIfNotProduction = lazypipe()
    .pipe(p.ifElse, !args.production, p.newer.bind(this, DEST));


//
// Lightweight templates for removing debug code when production flag set
//
// Removes single-line sections of javascript bookended by: /*<%*/  and  /*%>*/
// E.g.  /*<%*/ console.log("this line of JS gets removed"); /*%>*/
// Removes multiline js blocks bookended by: /*<{{DEBUG*/  and  /*DEBUG}}>*/
//                                    ...OR: /*<{{TEST*/   and   /*TEST}}>*/
//
rmDebugCode = lazypipe()
    .pipe(p.ifElse, !!args.production, p.replace.bind(this,
        /\/\*<\%.*\%\>\*\//g, ''))
    .pipe(p.ifElse, !!args.production, p.replace.bind(this,
        /\/\*<\{\{DEBUG\*\/[\s\S]*?\/\*DEBUG\}\}\>\*\//gm, ''))
    .pipe(p.ifElse, !!args.production, p.replace.bind(this,
        /\/\*<\{\{TEST\*\/[\s\S]*?\/\*TEST\}\}\>\*\//gm, ''));
//------------------------------------------------------------------------//


//****************************** STYLES ******************************//
/**
 * Compile SCSS to CSS, output to build directory.
 */
gulp.task('sass', function sass() {
    let filePaths = resolveSrcAndDest(PATHS.scss, { ext: 'sass' });

    return gulp.src(filePaths.src)
        .pipe(consoleTaskReport())
        .pipe(p.sass({errLogToConsole: true}))
        .pipe(p.ifElse( !!args.stats, p.size ))
        .pipe(gulp.dest(filePaths.dest));
});
//********************************************************************//


//******************************** JS ********************************//
/**
 * Transpiles all js files in source directory (/src) from ECMA6 to ECMA5,
 * outputs resultant js files into build directory (/build).
 */
gulp.task('js-build', function(){

    return merge(PATHS.js.map(function(files){
        let filePaths = resolveSrcAndDest(files, { ext: "js" });

        return gulp.src(filePaths.src)
            .pipe(consoleTaskReport())
            .pipe(p.babel({ compact: false }))
            .on('error', onError)
            .pipe(p.dev("got here!"))
            .pipe(gulp.dest(filePaths.dest));
    }));
});
//********************************************************************//


/**
 * Remove all files from build folder
 */
gulp.task('cleanup', function(cb){
    del(['build/**/*'], cb);
});


//************************** STATIC ASSETS ***************************//
/**
 * Copies static assets from source directory into build directory.
 */
gulp.task('copy', function copy(){
    return merge(PATHS.static.map(function(files){
        let filePaths = resolveSrcAndDest(files);

        //Actually output the files
        return gulp.src(filePaths.src)
            .pipe(consoleTaskReport())
            .pipe(p.debug({title: 'copy static assets:'}))
            .pipe(p.ifElse( !!args.stats, p.size ))
            .pipe(gulp.dest(filePaths.dest));
    }));
});
//********************************************************************//


//************************ LIVERELOAD SERVER *************************//
gulp.task('server', function livereloadServer(){
    livereload.listen();                    // listen for changes
    p.nodemon({                             // configure nodemon
        script: 'build/bin/launcher.js',    // the script to run the app
        ext: 'js dust json css scss sass html htm png jpg gif hbs ejs rb xml jpeg avi mp3 mp4 mpg py txt env'
    }).on('restart', function(){
        gulp.src('build/bin/launcher.js')   // when the app restarts, run livereload.
            .pipe(p.tap(function(file){
                console.log('\n' + gutil.colors.white.bold.bgGreen('\n' +
                '     .......... RELOADING PAGE, PLEASE WAIT ..........\n'));
            }))
            .pipe(notify({message: 'RELOADING PAGE, PLEASE WAIT', onLast: true}))
            .pipe(wait(1500))
            .pipe(livereload());
    });
});
//********************************************************************//


gulp.task('watch', function(){
    gulp.watch(SRC + '**/*.*', ['build'] );
});

gulp.task('build', ['sass', 'copy', 'js-build'] );

gulp.task('default', function(){
    runSequence('build', 'watch');
});