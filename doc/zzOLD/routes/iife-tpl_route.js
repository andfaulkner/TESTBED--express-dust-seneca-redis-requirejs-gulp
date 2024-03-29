console.log("enters iife-tpl route - very top");

var mn = "***** IIFE-TPL_ROUTE.JS ***** ::  ";

/**
 * Test route for function-based template testing.
 * Linked to /routes/dataTpls_view.dust
 * @return {Router}
 */
module.exports = function dataTpls_route_module(filename){
    console.log(mn + "enters iife-tpl route");

    console.log(mn + filename + '_route.js', '');

    //GET EXPRESS SERVER & ROUTER
    var express = require('express');
    var router  = express.Router();

    //GET LIBRARIES & NODE NATIVE MODULES
    var fs      = require('fs'),
        path    = require('path');
    var _       = require('lodash');

    console.log(mn + 'Got express server and all libs');

    //TEMPLATE DATA
    var context = require('template-data/iife-tpl_tpldata');

    console.log(mn + 'Got template data. TEMPLATE DATA START::: ');
    console.dir(context);
    console.log(mn + 'TEMPLATE DATA END');


/********************************** ROUTES **********************************/
    /*
     * GET dataTpls ROOT PAGE.
     */
    router.get('/', function(req, resp, next) {
      resp.render('iife-tpl_view', context);
    });
/****************************************************************************/

    // //@EXPORT
    // module.exports = router;
    return router;

};
