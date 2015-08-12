"use strict";

var requestIp = require('request-ip');

module.exports = function (req, resp, next) {
    console.log("request came in from: " + requestIp.getClientIp(req));
    console.log("request came in from: " + Object.keys(req.client));
    console.log("request came in from: " + req.ip);
    next();
};