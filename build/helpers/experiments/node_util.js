/**
 * @module node_util experiments
 */
"use strict";

(function nodeUtilExperiments() {
    console.log("\n");

    global.aString = "This is my string";

    var util = require('util');
    var debuglog = util.debuglog('foo');

    var bar = 123;

    debuglog('hello from foo [%d]', bar);

    console.log(global.aString);
    console.log("\n");

    // global.colors = require('colors');

    // console.log(util.inspect(global.colors));
    util.log('Timestamped message.');
})();