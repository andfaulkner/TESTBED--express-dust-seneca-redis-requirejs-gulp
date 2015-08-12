/**
 * login page route handler
 * Linked to /routes/{1:routename}_view.dust
 * @return {Router }
 */
'use strict';

(function login_route_module() {

    //GET EXPRESS SERVER & ROUTER
    var express = require('express');
    var router = express.Router();

    //GET LIBRARIES & NODE NATIVE MODULES
    var fs = require('fs'),
        path = require('path');
    var _ = require('lodash');

    //ROUTE-SPECIFIC TEMPLATE DATA
    var context = {
        route_name: "login",
        title: "Login"
    };

    /********************************** ROUTES **********************************/
    /*
     * GET login ROOT PAGE.
     */
    router.get('/', function (req, resp, next) {
        resp.render('login_view', context);
    });
    /****************************************************************************/

    //@EXPORT
    module.exports = router;
})();