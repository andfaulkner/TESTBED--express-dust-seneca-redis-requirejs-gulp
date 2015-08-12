/**
 * @module app.js
 * Loads the app components
 * @return {Express} app: server object
 */
'use strict';

(function setupExpressApp() {

    // LIBRARY MODULES
    var path = require('path');

    // EXPRESS SERVER
    // var livereload = require('express-livereload');
    var express = require('express');

    // MICRO-SERVICES
    // var seneca = require('services/seneca-index.js');

    // PLUGINS AND MIDDLEWARES
    var app = require('middlewares/register_middlewares.js')(express());

    // NODE EXPERIMENTS
    // require('helpers/experiments/node_console_test.js')(false);
    // require('helpers/experiments/node_util.js');

    // DATABASES
    require('models/redis.js');

    /****************** ROUTES & ROUTE-HANDLING MODULES *****************/
    app.use(express['static'](path.join(__dirname, 'public')));

    var routes = require('../config/routes.json'); //Get route list

    console.log("just before iife-tpl route registration");

    //uses route constructor on all routes registered in the config object
    routes.topLevelRoutes.forEach(function (routeOpts) {
        var file = routeOpts.file || routeOpts.route;
        app.use('/' + routeOpts.route, require('routes/proto_route.js')(file));
    });

    // //uses route constructor
    // app.use('/' + routes.testRoute.route,
    //     require(routes.routeDir + '/' +
    //             'proto_route.js')(routes.testRoute.route));
    //              // routes.testRoute.route + routes.routeSuffix)(routes.testRoute.route));

    // uses route module that takes a parameter
    // app.use('/' + routes.testRoute.route,
    //     require(routes.routeDir + '/' +
    //              routes.testRoute.route + routes.routeSuffix)(routes.testRoute.route));

    console.log("passes iife-tpl route registration");

    // //Create routes from route list items
    // routes.topLevelRoutes.forEach(function(rObj){
    //     rObj.file = rObj.file || rObj.route;

    //     //load an individual route-compiling module (e.g. routes/login_route.js)
    //     let routeFile = routes.routeDir + '/' + rObj.file + routes.routeSuffix;
    //     app.use('/' + rObj.route, (require(routeFile)));
    // });
    /********************************************************************/

    // ERROR HANDLING
    app = require('helpers/handle-errors.js')(app);

    module.exports = app;
})();