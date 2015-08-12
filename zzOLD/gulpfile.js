var gulp = require('gulp');

//Node modules & JS libraries
var path = require('path');
var fs = require('fs-extra');
var yargs = require('yargs');
var merge = require('merge2');
var _ = require('lodash');
var del = require('del');
require('shelljs/global');
var livereload = require('gulp-livereload');
var notify = require('gulp-notify');
var wait = require('gulp-wait');

//Polyfill
require('babel/register');
Object.getPrototypeOf.toString = function() {return Object.toString();};

//Gulp plugin list - all available under p.nameOfPackage
var p = require('gulp-packages')(gulp, [
    'autoprefixer',
    'babel',
    'debug',
    'dev',
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


//------------------------------ Constants -------------------------------//
var PATHS = require('./config/project-paths.json');
var SRC = PATHS.srcdir,
    DEST = path.join(__dirname, PATHS.destdir);
//-----------------------------------------------------------------------//


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
    console.log(gutil.colors.red.bgWhite("-----------------------------------"));
    console.log('ERROR OCCURRED');
    console.log(typeof err);
    console.log(gutil.colors.red.bgWhite(err));
    console.log(gutil.colors.red.bgWhite("-----------------------------------"));
    this.emit('end');
};
//---------------------------------------------------------//


//------------------------ reusable pipe components ------------------------//
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

/**
 * [resolveSrcAndDest description]
 * @param  {[type]} dirOrFile [description]
 * @return {Array[String,String]} Source location or file & destination dir
 */
var resolveSrcAndDest = function resolveSrcAndDest(dirOrFile, opts) {
    opts = opts || {};
    var srcFiles = path.join(SRC, dirOrFile);

    //If it's a directory
    if (_.last(dirOrFile.split('')) === '/') {
        return ([srcFiles + '**/*.' + ((!!opts.ext) ? opts.ext : '*'),
                path.join(DEST, dirOrFile)]);
    }

    //If it's a file
    var destdir = dirOrFile.match(/[a-zA-z\/]+(?=\/)\//mig);
    return ([srcFiles,
           (_.isArray(destdir)) ? path.join(DEST, destdir.join('')) : DEST]);
};


/**
 * Transpiles all js files in source directory (/src) from ECMA6 to ECMA5,
 * outputs resultant js files into build directory (/build).
 */
gulp.task('jsBuild', function(){

    return merge(PATHS.js.map(function(files){
        var srcAndDest = resolveSrcAndDest(files, { ext: "js" });

        return gulp.src(srcAndDest[0])
            .pipe(consoleTaskReport())
            .pipe(p.babel({ compact: false }))
            .on('error', onError)
            .pipe(p.dev("end of js compile; about to output"))
            .pipe(gulp.dest(srcAndDest[1]));
    }));
});

/**
 * Remove all files from build folder
 */
gulp.task('cleanup', function(cb){
    del(['build/**/*'], cb);
});

gulp.task('newcopy', function(){
});


/**
 * Copies static assets from source directory into build directory.
 */
gulp.task('copy', function(){
    return merge(PATHS.static.map(function(files){
        var srcAndDest = resolveSrcAndDest(files);
        var srcFiles = srcAndDest[0];
        var destFolder = srcAndDest[1];

        //Actually output the files
        return gulp.src(srcFiles)
            .pipe(consoleTaskReport())
            .pipe(p.debug({title: 'copy static assets:'}))
            .pipe(p.ifElse( !!args.stats, p.size ))
            .pipe(gulp.dest(destFolder));
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

//************************ LIVERELOAD SERVER *************************//
gulp.task('server', function livereloadServer(){

    console.log(livereload);
    // listen for changes
    livereload.listen();
    // configure nodemon
    p.nodemon({
        // the script to run the app
        script: 'build/bin/launcher.js',
        ext: 'js dust json css scss sass html htm png jpg gif hbs ejs rb xml jpeg avi mp3 mp4 mpg py txt env'
    }).on('restart', function(){
        // when the app has restarted, run livereload.
        gulp.src('build/bin/launcher.js')
            .pipe(notify('Reloading page, please wait...'))
            .pipe(wait(1500))
            .pipe(livereload());
    });
});


//********************************************************************//


//*************************** COMPILE DUST ***************************//
// /**
//  * Precompiles Dust templates
//  */
// gulp.task('dust', function dust(){
//     return gulp.src(SRC.views + "**/*.dust")
//         .pipe(p.dust({
//             whitespace: true
//         }))
//         .pipe(gulp.dest(DEST.compiledTpls));
// });
//********************************************************************//


gulp.task('watch', function(){
    gulp.watch(SRC.root + '**/*.*', ['build'] );
});

gulp.task('build', ['sass', 'copy', 'jsBuild'] );

gulp.task('default', function(){
    runSequence('build', 'watch');
});