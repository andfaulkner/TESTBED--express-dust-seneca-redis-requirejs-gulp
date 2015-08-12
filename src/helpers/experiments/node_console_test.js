(function() {

    var logConf = {
        time: true,
        err: true,
        log: true,
        dir: true,
        trace: true,
        assert: true
    };

    console.orig = { };

    var logFns = [{ log: "log" }, { info: "log" }, { error: "err" },
                   { warn: "err" }, { time: "time" }, { timeEnd: "time" },
                  { dir: "dir" }, { trace: "trace" }, { assert: "assert" }];

    //Copy all global console fns to console.orig, then override them with a fn
    //that outputs based on the value of the associated config value in logConf
    logFns.forEach(item => {
        let fn = Object.keys(item)[0];
        console.orig[fn] = console[fn];
        console[fn] = (...rest) =>
            (logConf[item[fn]] ? console.orig[fn].apply(null, rest) : null);
    });

    /**
     * Overrides trace to have a less error-
     * @param  {...[type]} rest [description]
     * @return {[type]}         [description]
     */
    console.trace = (str, ...rest) => {
        let cl = console.orig.log || console.log;
        cl((Array(100).join(" ").green.bgGreen));
        console.orig.trace(str.green.bold.bgBlue, rest.join(", "));
        cl((Array(100).join(" ").green.bgGreen));
    };


    module.exports = function consoleExportTest(isDebugTest){

        if (isDebugTest){
            console.time("time 1");
            console.log("[data]", "console.log test");
            console.info("[data]", "console.info test");

            console.error("An error!");
            console.warn("A warning!");

            console.log('\n\n\n\n');
            console.dir("console.dir test::: ");
            console.dir(require('util'));
            console.log('\n\n\n\n\n\n\n\n');

            console.dir("console.dir with all hidden shown and a display depth of 20::: ");
            console.dir(require('util'), { showHidden: true, depth: 20, colors: true });
            console.log('\n\n\n\n');
            console.timeEnd("time 1");
        } else {
            console.log("node_console_test::: ", "logging experiments off\n");
        }

    };

}());