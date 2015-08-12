'use strict';

(function redisSetup() {

    //Modules
    var redis = require("redis");

    var client = redis.createClient(9999, '127.0.0.1', { no_ready_check: true });

    client.on('connect', function () {
        console.log("Connected to Redis!");
        client.set('defaultUser', 'andrew', redis.print);

        client.get('defaultUser', function handleRetDefaultUser(err, reply) {
            if (err) throw err;
            console.log(reply.toString());
        });
    });
})();