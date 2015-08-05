'use strict';

var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var context = require('data/index-data.json');

var appDir = path.dirname(require.main.filename);

console.log(appDir);
console.log(__dirname);
console.log(path.resolve(__dirname));
console.log(process.env.TEST_VALUE);

/* GET home page. */
router.get('/', function (req, resp, next) {
  resp.render('index', context);
});

router.post('/test', function (req, resp, next) {
  resp.send('OK');
});

module.exports = router;