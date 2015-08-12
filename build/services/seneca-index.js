'use strict';

(function senecaIndex() {

    //Seneca instance
    var seneca = require('seneca')().use(require('services/math-plugin'), { logfile: './math.log' });

    var catchErrConsole = function consoleCatcher(err, result) {
        if (err) return console.error(err);
        console.log(result);
    };

    //***************************** CALL SENECA SERVICES *****************************//
    //Call sum service. 'integer: true' version runs: the most specific match always wins
    seneca.act({ role: 'math', cmd: 'sum', left: 1, right: 2, integer: true }, function (err, result) {
        if (err) return console.error(err);
        console.log(result);
    });

    //Call multiplying service - this is the wrong way to do it (a callback)
    seneca.act({ role: 'math', cmd: 'sum', left: 1, right: 2 }, function (err, result) {
        seneca.act({ role: 'math', cmd: 'product', left: result.answer, right: 4 }, function (err, result) {
            if (err) return console.error(err);
            console.log(result);
        });
    });

    //Call services in a chain - the right way to do it
    seneca.act({ role: 'math', cmd: 'sum', left: 1, right: 5 }, catchErrConsole).act({ role: 'math', cmd: 'product', left: 5, right: 8 }, catchErrConsole).act('role:math,cmd:sum,integer:true,left:48,right:21', catchErrConsole);
    //********************************************************************************//

    return seneca;
})();