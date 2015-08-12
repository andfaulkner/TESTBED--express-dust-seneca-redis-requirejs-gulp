'use strict';

(function mathPlugin() {

    var fs = require('fs');

    module.exports = function math(options) {

        var log;

        //Seneca service that sums 2 numbers
        this.add('role:math,cmd:sum', sum);
        this.add('role:math,cmd:sum,integer:true', sumIntegerOnly);
        this.add('role:math,cmd:product', product);
        this.add('role:math,cmd:product,integer:true', productIntegerOnly);

        //Special init function
        this.add('init:math', init);

        function init(msg, respond) {
            fs.open(options.logfile, 'a', function (err, fd) {
                if (err) return respond(err);
                log = make_log(fd);
                respond();
            });
        }

        function sum(msg, respond) {
            var out = { answer: msg.left + msg.right };
            log('sum ' + msg.left + ' + ' + msg.right + ' = ' + out.answer + '\n');
            respond(null, out);
        }

        function sumIntegerOnly(msg, respond) {
            this.act({
                role: 'math',
                cmd: 'sum',
                left: Math.floor(msg.left),
                right: Math.floor(msg.right)
            }, respond);
        }

        function product(msg, respond) {
            var out = { answer: msg.left * msg.right };
            log('product ' + msg.left + ' * ' + msg.right + ' = ' + out.answer + '\n');
            respond(null, out);
        }

        //Note the action pattern: it's defined in more convenient 'jsonic' format
        function productIntegerOnly(msg, respond) {
            this.act({
                role: 'math',
                cmd: 'product',
                left: Math.floor(msg.left),
                right: Math.floor(msg.right)
            }, respond);
        }

        function make_log(fd) {
            return function (entry) {
                fs.write(fd, new Date().toISOString() + ' ' + entry, null, 'utf8', function (err) {
                    if (err) return console.log(err);

                    // ensure log entry is flushed
                    fs.fsync(fd, outputError);
                });
            };
        }

        function outputError(err, next) {
            if (err) return console.log(err);
            if (next) next();
        }
    };

    require('seneca')().use(module.exports, { logfile: './log' }).act('role:math,cmd:sum,left:1,right:2', console.log);

    return module.exports;
})();