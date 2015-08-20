var gulp = require('gulp');

//NODE MODULES & JS LIBRARIES
var path    = require('path'),
    fs      = require('fs-extra'),
    yargs   = require('yargs'),
    merge   = require('merge2'),
    _       = require('lodash'),
    del     = require('del'),
    async   = require('async');

require('shelljs/global');

//ECMA 6 POLYFILL
require('babel/register');
Object.getPrototypeOf.toString = function() {
    return Object.toString();
};

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
    'display-help',             // Display help file
    'dust',                     // Compile Dust templates
    'express',                  // Launch express framework
    'exit',                     // Force quit Gulp process
    'filter',                   // Filter out unwanted files from stream
    'if-else',                  // if-else statements mid-stream
    'jshint',                   // display Javascript errors
    'newer',                    // Only push item through pipe if newer
    'livereload',               // Relaunch in browser automatically
    'nodemon',                  // Keep server running - restart on crash
    'notify',                   // Tells you if a reload happens
    'plumber',                  // keep running if error occurs
    'print',                    // output errors to console
    'rename',                   // Rename files
    'replace',                  // find-and-replace text in files
    'rimraf',                   // remove files
    'sass',                     // compile scss and sass --> css
    'shell',                    // run shell commands with gulp
    'size',                     // output file size
    'stats',                    // provides stats on files passed thru stream
    'tap',                      // run function mid-stream
    'webpack',                  // compile webpack
]);

//UNPACKAGEABLE GULP PLUGINS
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
    console.log(gutil.colors.red.bgWhite('-----------------------------------'));
    console.log('ERROR OCCURRED');
    console.log(typeof err);
    console.log(gutil.colors.red.bgWhite(err.toString()));
    console.log(gutil.colors.red.bgWhite('-----------------------------------'));
    this.emit('restart');
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



//################################################################################
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~ REUSABLE PIPE COMPONENTS ~~~~~~~~~~~~~~~~~~~~~~~~~~
//################################################################################
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
//#################################################################################



//################################################################################
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ STYLES  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//################################################################################
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
//#################################################################################



//################################################################################
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ JS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//################################################################################
/**
 * Transpiles all js files in source directory (/src) from ECMA6 to ECMA5,
 * outputs resultant js files into build directory (/build).
 */
gulp.task('js-build', () =>
    consoleTaskReport().pipe(merge(PATHS.js.map( (files) => {
        let filePaths = resolveSrcAndDest(files, { ext: 'js' });

        return gulp.src(filePaths.src)
            .pipe(p.filter(['*', '!**/*.swp', '!**/*.*~']))
            .pipe(consoleTaskReport())
            .pipe(p.babel({ compact: false }))
                .on('error', onError)
            .pipe(p.dev('got into js-build end!'))
            .pipe(gulp.dest(filePaths.dest));

    }))).on('error', onError));
//#################################################################################


/**
 * Remove all files from build folder
 */
gulp.task( 'cleanup', ((next) => del(['build/**/*'], next)) );


//################################################################################
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ STATIC ASSETS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//################################################################################
/**
 * Copies static assets from source directory into build directory.
 */
gulp.task('copy', function copy(){
    return merge(PATHS.static.map(function(files){
        let filePaths = resolveSrcAndDest(files);

        //Actually output the files
        return gulp.src(filePaths.src)
            .pipe(p.filter(['*', '!**/*.swp', '!**/*.*~']))
            .pipe(consoleTaskReport())
            .pipe(p.debug({title: 'copy static assets:'}))
            .pipe(p.ifElse( !!args.stats, p.size ))
            .pipe(gulp.dest(filePaths.dest));
    }));
});
//#################################################################################


function fileExists(filePath, callback){
    fs.stat(filePath, (err, stats) => {
        if (err) return callback(false);
        return callback(stats.isFile());
    });
}


/**
 * Each file
 * @param  {String}  filePath     path of file to check existence of
 * @param  {Boolean} isJSConfig   if true, will check for .js & .json of filePath
 *                                (filePath should have no ext in this case), &
 *                                only make new file if neither exist.
 * @param  {String}  defaultData  data to write into the file
 * @return {undefined}
 */
function makeDefaultFiles(filePath, isJSConfig, defaultData){
    if (isJSConfig) {

        async.some([filePath + '.js', filePath + '.json'], fileExists, function(result){

            if (result === true) return;
            return fs.writeFile(filePath + '.json', defaultData, function(err) {
                if (err) return console.log('_______openOrMake:: ERROR in fs.writeFile on ' + filePath + '.json. Error: ' + err);
                return console.log('makeDefaultFiles:: new' + filePath + '.json file written!');
            });
        });

    //if not js/json file
    } else {

        fileExists(filePath, function(doesExist){
            if (doesExist === true) return;
            return fs.writeFile(filePath, defaultData, function(err) {
                if (err) return console.log('fs.writeFile ERROR: ' + filePath);
                return console.log('fs.writeFile success for ' + filePath);
            });
        });
    }

}





//***************** CREATE FILES IF THEY DON'T EXIST BASED ON CONFIG CONTENTS *****************//
gulp.task('makeRoutes', function makeRoutes(){

    var routes = require(path.join(__dirname, 'config/routes.json'));
    var defJSON = '{"default":"default"}'; //def contents to write if no file

    fs.readFile(path.join(__dirname, 'config/default_view_template.dust'), function(err, dustData) {
        if (err) throw err;

        fs.readFile(path.join(__dirname, 'config/default_frontend_js_file.js'), function(err, clientJSData) {

            routes.forEach(function(route) {
                var fn = (route.file || route.request_path);
                var tplDataPathNoExt = path.join(__dirname, 'src/template-data', fn + '_tpldata'),
                    tplViewPath = path.join(__dirname, 'src/views', fn + '_view.dust'),
                    frontendJSPath = path.join(__dirname, 'src/public/javascripts', fn + '_frontend.js');

                makeDefaultFiles( tplDataPathNoExt, true, defJSON );
                makeDefaultFiles( tplViewPath, false, dustData );
                makeDefaultFiles( frontendJSPath, false, _.template(clientJSData)(
                              { routeNameCC: _.camelCase(fn), routeName: fn }
                ) );
            });

        });

    });

    console.log('past forEach');

});
    //********************************************************************//




//################################################################################
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ LIVERELOAD SERVER ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//################################################################################
gulp.task('server', function livereloadServer(){
    livereload.listen();                    // listen for changes
    return consoleTaskReport()
        .pipe(p.nodemon({                       // configure nodemon
            script: 'build/bin/launcher.js',    // the script to run the app
            ext: 'js dust json css scss sass html htm png jpg gif hbs ejs rb xml jpeg avi mp3 mp4 mpg py txt env'

        }).on('restart', () => {
           livereload.listen();
           return gulp.src('build/bin/launcher.js')   // when the app restarts, run livereload.
                .pipe(consoleTaskReport())
                .pipe(p.tap(() => {
                    console.log('\n' + gutil.colors.white.bold.bgGreen('\n' +
                    '     .......... RELOADING PAGE, PLEASE WAIT ..........\n'));
                }))
                .pipe(notify({message: 'RELOADING PAGE, PLEASE WAIT', onLast: true}))
                .pipe(wait(1500))
                .pipe(livereload());
        }));

    });
//#################################################################################

gulp.task('build', ['sass', 'copy', 'js-build'] );

gulp.task('watch', function(){
    gulp.watch([SRC + '**/*.*', path.join(__dirname, 'config/**/*.*')], () =>
        runSequence('makeRoutes', 'build'));
});

gulp.task('default', () => { runSequence('makeRoutes', 'build', 'watch'); });
