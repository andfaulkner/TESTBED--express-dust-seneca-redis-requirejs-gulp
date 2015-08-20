module.exports = function() {

var colors = require('colors');

console.log("******************* in iife-tpl-tpldata.js! ***************** ".green);

// get dust
var kleiDust = require('klei-dust');
var dust = kleiDust.getDust();
var dust1 = require('dustjs-linkedin');

var context = dust.makeBase();

var newContext = context.push({
        "foo": "barrrrrrrrrroooooooooo!",
        "one": {
            "two": "Hello!"
        }
    })
    .push("level2")
    .push("level3")
    .push("level4")
    .push("this one gets popped off");

console.log("******************* in iife-tpl-tpldata.js! --- 2 ***************** ");

newContext.pop();
newContext.pop();
newContext.pop();
newContext.pop();

console.log("~~~~~ in iife-tpl-tpldata.js ::: newContext::: " + newContext);

console.dir(newContext, { depth: 20, colors: true } );

console.log("returned object: " + newContext.stack.head);

return newContext.stack.head;

//return context.push({
//    "foo": "bar",
//    "one": "oneone",
//    "Hello": "allo allo!"
//});

};



//{
//    "testitem": "testvalue",
//    "Hello": "Aloha everybody!"
//}

