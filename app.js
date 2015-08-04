/**
 * @module app.js
 * Loads the app components
 * @return {Express} app: server object
 */
(function setupExpressApp(){

    // LIBRARY MODULES
    var path = require('path');

    // EXPRESS SERVER
    var express = require('express');

    // ROUTE MODULES
    var routes = require('routes/index'),
        imgLoadAsync = require('routes/img-load-async');
        users = require('routes/users');

    //PLUGINS AND MIDDLEWARES
    var app = require('./middlewares/register_middlewares.js')(express());

    // ROUTES
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/', routes);
    app.use('/users', users);
    app.use('/img-load-async', imgLoadAsync);

    // ERROR HANDLING
    app = require('./helpers/handle-errors.js')(app);

    module.exports = app;
}());