(function route_index() {
    console.log("***** index_route.js::: GETS HERE *****");

    //Get and build express server & router
    var express = require('express');
    var router  = express.Router();

    console.log("in index route");

    //Get node native modules
    var fs      = require('fs'),
        path    = require('path');

    //Grab data --- CONFIRMED IMPORT SUCCESS
    var context = require('template-data/index_tpldata.json');

    /* GET home page. */
    router.get('/', function(req, resp, next) {
        console.log("in index get");
        console.log("***** index_route.js::: GETS INTO GET *****");
        resp.render('index_view', context);
        // resp.send('OK');
    });

    router.post('/test', function(req, resp, next){
        resp.send('OK');
    });

    // /home/andfaulkner/Projects/express/express-test-3/_src/routes/index.js
    module.exports = router;

})();