var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var context = require('data/img-load-async-data.json');


var appDir = path.dirname(require.main.filename);

/* GET pile of images. */
router.get('/', function(req, res, next) {
  res.render('img-load-async', context);
});

router.post('/test', function(req, resp, next){
    resp.send('OK');
});

module.exports = router;
