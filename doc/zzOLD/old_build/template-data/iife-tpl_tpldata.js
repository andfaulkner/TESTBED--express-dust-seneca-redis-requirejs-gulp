(function(){

console.log(global.all_routes);

var dust = require('dustjs-linkedin');

var context = dust.makeBase();

var newContext = context.push({
        "foo": "bar",
        "one": {
            "two": "Hello!"
        }
    })
    .push("level2")
    .push("level3")
    .push("level4")
    .push("this one gets popped off");

newContext.pop();

return newContext;

}());