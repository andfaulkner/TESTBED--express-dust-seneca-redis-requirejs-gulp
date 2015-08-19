/*
 * @module proto_route
 * 
 * @description
 * PROTOTYPE OF ALL ROUTE FILES - LOADS TEMPLATE-DATA FILE WITH SAME
 * NAME AS ROUTE FILENAME PASSED IN, RENDERS IT -- UPON RECEIVING
 * GET REQUEST TO localhost/[base_name]
 */

var mn = "***** PROTO_ROUTE.JS ***** ::  ";
/**/ console.log(mn + "(PROTO) very top");


/** 
 * Test route for function-based template testing.
 * Linked to /routes/dataTpls_view.dust
 * @param {String} base_name - name of route file minus prefixes & suffixes, but
 *                 with relative path included
 * @return {Router}
 */
module.exports = (function(){


//################################################################################//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~ CONSTRUCTED ROUTE OBJECT ~~~~~~~~~~~~~~~~~~~~~~~~~~//
//################################################################################//
 var route_prototype = function route_prototype(base_name, config){

    config = config || {};

    /**/ console.log(mn + "(PROTO) enters route");
    /**/ console.log(mn + base_name + '_route.js (PROTO)', '');

    //GET EXPRESS SERVER & ROUTER
    var express = require('express');
    var router  = express.Router();

    //GET LIBRARIES & NODE NATIVE MODULES
    var fs      = require('fs'),
        path    = require('path'),
        _       = require('lodash'),
        routes  = require('../../config/routes.json');

    /**/ console.log(mn + 'Got express server and all libs (PROTO)');

    var context;

    //TEMPLATE DATA
    if (config.launchRoute === true) { // :( - hack city bitch, hack hack city bitch 
        console.log("inside template data 'launchRoute is true'");
        context = require(routes.tplData.dir + '/' +
                          base_name + routes.tplData.filenmSuffix)();
        console.log(mn + "\n" + "     ****&*&*&*&*&*&*&*&*&*&*&*****     "
                    .green.bgWhite);
        console.dir(context);
        console.log(mn + "\n" + "     ****&*&*&*&*&*&*&*&*&*&*&*****     "
                    .green.bgWhite);
    } else {
        context = require(routes.tplData.dir + '/' +
                          base_name + routes.tplData.filenmSuffix);
    }

    /**/ console.log(routes.tplData.dir + '/' + base_name + routes.tplData.filenmSuffix);

    /**/ console.log(mn + '(PROTO) Got tmpl data.' /* + 'TEMPLATE DATA START' */);
    /**/ console.dir(context);   /**/ console.log(mn + '(PROTO) TEMPLATE DATA END');


    /****************************** ROUTES ******************************/
    /* GET dataTpls ROOT PAGE */
    router.get('/', function(req, resp, next) {
        /**/ console.log(mn + '(PROTO) REQUEST FOR /' + base_name);
        resp.render(base_name + '_view', context);
    });

    router.post('/', function(req, resp, next){
        resp.send('OK\n');
    });
    /********************************************************************/

    // //@EXPORT
    return router;
 };
//##################################################################################


 return route_prototype;

}());
