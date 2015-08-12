/**
 * @module app.js
 * Loads the app components
 * @return {Express} app: server object
 */
(function setupExpressApp(){

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
    app.use(express.static(path.join(__dirname, 'public')));

    let routes = require('../config/routes.json'); //Get route list

    //uses route constructor on all routes registered in the config object
    routes.topLevelRoutes.forEach(function(routeOpts){
        let file = routeOpts.file || routeOpts.route;
        app.use('/' + routeOpts.route, require('routes/proto_route.js')(file));
    });
  /********************************************************************/

    // ERROR HANDLING
    app = require('helpers/handle-errors.js')(app);

    module.exports = app;
}());
