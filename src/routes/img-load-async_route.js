(function imgLoadAsync_route_module(){

var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var context = require('template-data/img-load-async_tpldata.json');


var appDir = path.dirname(require.main.filename);

/* GET pile of images. */
router.get('/', function(req, res, next) {
  res.render('img-load-async_view', context);
});

router.post('/test', function(req, resp, next){
    resp.send('OK');
});

module.exports = router;

}());