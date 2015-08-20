/**
 * @module app.js
 * Loads the app components.
 * @return {Express} app: server object
 */
"use strict";

(function setupExpressApp() {

    // LIBRARY MODULES
    var path = require('path');

    /*<PATHS*/console.log("--------------------+process.env.PWD app.js+------------------------");
    /*<PATHS*/console.log(process.env.PWD);
    /*<PATHS*/console.log("--------------------+process.env.PWD+------------------------");
    /*<PATHS*/process.env.PWD = path.join(process.env.PWD, "/build");
    /*<PATHS*/console.log("--------------------+process.env.PWD app.js+------------------------");
    /*<PATHS*/console.log(process.env.PWD);
    /*<PATHS*/console.log("--------------------+process.env.PWD+------------------------");

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

    // DATABASE
    require('models/redis.js');

    /****************** ROUTES & ROUTE-HANDLING MODULES *****************/
    app.use(express["static"](path.join(__dirname, 'public')));

    var routes = require('../config/routes.json'); //Get route list

    //Constructs route for all routes registered in config/routes.json
    routes.forEach(function (route) {
        var file = route.file || route.request_path;
        var routeConfig = route.routeConfig || {};
        if (route.type !== "data_receiver") {
            app.use('/' + route.request_path, require('routes/proto_route.js')(file, routeConfig));
        } else {
            app.use('/' + route.request_path, require('routes/proto_data_receiver_route.js')(file, routeConfig));
        }
    });
    /********************************************************************/

    // ERROR HANDLING
    app = require('helpers/handle-errors.js')(app);

    module.exports = app;
})();