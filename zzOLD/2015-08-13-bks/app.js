//Allow JSON files with comments in them
// require('json-comments');

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

    //PLUGINS AND MIDDLEWARES
    var app = require('middlewares/register_middlewares.js')(express());

    //NODE EXPERIMENTS
    // require('helpers/experiments/node_console_test.js')(false);
    // require('helpers/experiments/node_util.js');

    //DATABASES
    require('models/redis.js');

    /*************************** ROUTES ******************************/
    // ROUTES & ROUTE-HANDLING MODULES
    app.use(express['static'](path.join(__dirname, 'public')));

    //Get route list
    var routes = require('../config/routes.json');

    //Create routes from route list items
    routes.topLevelRoutes.forEach(function (rObj) {
        rObj.file = rObj.file || rObj.route;
        var routeFile = routes.routeDir + '/' + rObj.file + routes.routeSuffix;

        app.use('/' + rObj.route, require(routeFile));
    });
    /*****************************************************************/

    // ERROR HANDLING
    app = require('helpers/handle-errors.js')(app);

    module.exports = app;
})();