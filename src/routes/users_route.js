/**
 * Users page
 * Linked to /routes/users_view.dust
 * @return {Router}
 */
(function users_route_module(){

    //GET EXPRESS SERVER & ROUTER
    var express = require('express');
    var router  = express.Router();

    //GET LIBRARIES & NODE NATIVE MODULES
    var fs      = require('fs'),
        path    = require('path');
    var _  = require('lodash');


    //TEMPLATE DATA
    var context = require('template-data/users_tpldata.json');


/********************************** ROUTES **********************************/
    /*
     * GET users ROOT PAGE.
     */
    router.get('/', function(req, resp, next) {
      resp.render('users_view', context);
    });
/****************************************************************************/

    //@EXPORT
    module.exports = router;

}());