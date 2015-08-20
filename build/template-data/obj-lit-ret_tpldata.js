module.exports = function objLitRet() {

    //closure

    return ({
        "contentTest": 'content test data!',
        "route_name": 'obj-lit-ret',
        "gears": {
            "status": "OK",
            "error": false
        },
        "engine": {
            "status": "OK",
            "error": false,
            "oilLevel": 0.5,
            "temperature": 80
        },
        "appStatusOK": function(chunk, context, bodies, params) {
            console.log(params);
            if (this.gears.error) {
                return chunk.render(bodies.gearsError, context);
            } else if (this.engine.error) {
                return chunk.render(bodies.engineError, context);
            } else if (this.engine.oilLevel < 0.7) {
                return chunk.render(bodies.oilLevelError, context);
            }
            return true;
        }
    });

};