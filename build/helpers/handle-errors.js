'use strict';

var path = require('path');

module.exports = function (app, list) {

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // Development error handler; Will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error_view', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler; no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error_view', { //maybe just "error"?
            message: err.message,
            error: {}
        });
    });

    return app;
};