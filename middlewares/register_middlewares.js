var path = require('path'),
    _ = require('lodash'),
    kleiDust = require('klei-dust');

module.exports = function(app){
    console.log("***** in register_middlewares function! *****");

    //Registry of all middlewares, along with their configuration
    var middlewareList = [
        {
            module: require('serve-favicon'),
            params: [path.join(__dirname, '..', 'public', 'favicon.ico')]
        },
        {
            module: require('morgan'),
            params: ['dev']
        },
        {
            module: require('cookie-parser')
        },
        {
            module: require('body-parser'),
            submoduleList: [
                { module: 'json' },
                { module: 'urlencoded', params: [{ extended: false }] }
            ]
        },
        {
            module: require('node-sass-middleware'),
            params: [{
                src: path.join(__dirname, 'public'),
                dest: path.join(__dirname, 'public'),
                indentedSyntax: true,
                sourceMap: true
            }]
        }
    ];

    //Recursively installs all middlewares + their configuration
    (function installMiddlewares(list, parentModule){

        list.forEach(function registerMiddleware(item){
            var params = item.params || [];

            if (!!item.submoduleList) {
                installMiddlewares(item.submoduleList, item.module);

            } else {
                if (!!parentModule) {
                    app.use(parentModule[item.module].apply(this, params));
                } else {
                    app.use(item.module.apply(this, params));
                }
            }
        });

    }(middlewareList));

    // VIEW ENGINE SETUP - allows parsing of dust templates
    app.set('views', path.join(__dirname, '..', 'views'));
    app.engine('dust', kleiDust.dust);
    app.set('view engine', 'dust');
    app.set('view options', {layout: false});
    // app.set('view engine', 'hbs');

    //Display user ip address
    app.use(require('middlewares/ip-output'));

    return app;
};