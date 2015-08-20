/*
 * @module proto_route
 *
 * @description
 * PROTOTYPE OF ALL ROUTE FILES - LOADS TEMPLATE-DATA FILE WITH SAME
 * NAME AS ROUTE FILENAME PASSED IN, RENDERS IT -- UPON RECEIVING
 * GET REQUEST TO localhost/[base_name]
 */

"use strict";

var mn = "***** PROTO_ROUTE.JS ***** ::  "; /**/console.log(mn + "(PROTO) very top");
var stdout = require('helpers/stdout');

//################################################################################//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~ CONSTRUCTED ROUTE OBJECT ~~~~~~~~~~~~~~~~~~~~~~~~~~//
//################################################################################//
module.exports = (function () {

    /*<PATHS*/console.log("--------------------+process.env.PWD proto_route.js+------------------------");
    /*<PATHS*/console.log(process.env.PWD);
    /*<PATHS*/console.log("--------------------+process.env.PWD+------------------------");

    /**
     * Builds everything needed to handle a route
     * @param  {String} base_name - uri path that triggers route e.g. "users"
     *             triggered by "http://thesite.com/users". Also name of
     *             template data file (e.g. "template-data/users_tpldata.js")
     *             & view file (e.g. views/users_view.dust).
     * @param  {Object} config    - provide properties to alter route handling:
     *                  |-> .launchRoute: true to "execute" template file - use
     *                                    if it's a js rather than json module
     * @return {Router}
     */
    var route_prototype = function route_prototype(base_name, config) {
        config = config || {};

        //GET EXPRESS SERVER & ROUTER
        var express = require('express');
        var router = express.Router();

        //GET LIBRARIES & NODE NATIVE MODULES
        var path = require('path'),
            _ = require('lodash'),
            routes = require('../../config/routes.json'),
            fs = require("fs");

        //Log names of files used
        /**/console.log('template-data/' + base_name + "_tpldata.[js|json]");
        /**/console.log('views/' + base_name + "_view.dust");

        var tplDataPathBase = path.join('../template-data/' + base_name + '_tpldata');
        var tplViewPath = path.join('../views/' + base_name + "_view.dust");

        var context;

        try {
            context = require(tplDataPathBase);
            if (config.launchRoute === true) {
                context = context();
                /**/ //stdout.object_highlighted(context, mn, 5);
            }
        } catch (e) {
            console.log(mn + e);
            context = {};
        }

        /****************************** ROUTES ******************************/
        /* GET dataTpls ROOT PAGE */
        router.get('/', function (req, resp, next) {
            /**/console.log(mn + '(PROTO) REQUEST FOR /' + base_name);
            resp.render(base_name + '_view', context);
        });

        router.post('/', function (req, resp, next) {
            resp.send('OK\n');
        });
        /********************************************************************/

        // //@EXPORT
        return router;
    };
    //##################################################################################

    return route_prototype;
})();