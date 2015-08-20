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
var src = PATHS.srcdir,
    dest = PATHS.destdir;
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
    .pipe(p.ifElse, !args.production, p.newer.bind(this, DEST.root));


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
 * Transpiles all js files in source directory (/src) from ECMA6 to ECMA5,
 * outputs resultant js files into build directory (/build).
 */
gulp.task('jsBuild', function(){
    var jsFileOps = [
        {src: SRC.root  + '*.js', dest: DEST.root },
        {src: SRC.services  + '**/*.js', dest: DEST.services },
        {src: SRC.models  + '**/*.js', dest: DEST.models },
        {src: SRC.bin  + '**/*.js', dest: DEST.bin },
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
            .on('error', onError)
            .pipe(p.dev("got here!"))
            .pipe(gulp.dest(file.dest));
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
    return merge(PATHS.static.map(function(dir){
        var srcdir = src + dir;

        var destdir = (srcdir.search(/\.[a-zA-Z]{2}/mig !== -1)) ?
                srcdir.match(/[a-zA-z\/]+(?=\/)\//mig).join("") :
                    dest + dir;

        return gulp.src(srcdir)
            .pipe(consoleTaskReport())
            .pipe(p.debug({title: 'copy static assets:'}))
            .pipe(p.ifElse( !!args.stats, p.size ))
            .pipe(gulp.dest(destdir));
    }));

/*    var jsCopyPaths = [
        {src: SRC.images + '*.*', dest: DEST.images },
        {src: SRC.views + '*.*', dest: DEST.views },
        {src: SRC.templatedata + '*.*', dest: DEST.templatedata },
        {src: SRC.favicon, dest: DEST.favicon },
        {src: './node_modules/jquery/dist/jquery.js',
         dest: './build/public/lib/' }
    ];
    return merge(jsCopyPaths.map(function(file){
        return gulp.src(file.src)
            .pipe(consoleTaskReport())
            .pipe(p.debug({title: 'images : '}))
            .pipe(p.ifElse( !!args.stats, p.size ))
            .pipe(gulp.dest(file.dest));
    }));
*/
    // var jsCopyPaths = [
    //     {src: SRC.images + '*.*', dest: DEST.images },
    //     {src: SRC.views + '*.*', dest: DEST.views },
    //     {src: SRC.templatedata + '*.*', dest: DEST.templatedata },
    //     {src: SRC.favicon, dest: DEST.favicon },
    //     {src: './node_modules/jquery/dist/jquery.js',
    //      dest: './build/public/lib/' }
    // ];
    // return merge(jsCopyPaths.map(function(file){
    //     return gulp.src(file.src)
    //         .pipe(consoleTaskReport())
    //         .pipe(p.debug({title: 'images : '}))
    //         .pipe(p.ifElse( !!args.stats, p.size ))
    //         .pipe(gulp.dest(file.dest));
    // }));
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
