(function senecaIndex(){

    //Seneca instance
    var seneca = require('seneca')();

    function consoleCatcher(err, result){
        if( err ) return console.error( err );
        console.log( result );
    }

//**************************** DEFINE SENECA SERVICES ****************************//
    //Seneca service that sums 2 numbers
    seneca
        .add(
            { role: 'math', cmd: 'sum' },           // pattern to match; can be any properties
            function( msg, respond ) {              // action fn: operates on params given in obj w pattern 2 match
                var sum = msg.left + msg.right;
                respond( null, { answer: sum } );   // response obj given result of action fn operation
        })


/*      //Extend Seneca sum service (not used here, but kept for example):
        .add({role: 'math', cmd: 'sum', integer: true },
             function( msg, respond ){
                 var sum = Math.floor( msg.left ) + Math.floor( msg.right );
                 respond( null, { answer: sum, sourceService: "cmd:sum, integer:true" } );
         })
*/

        //Extend Seneca sum service - use previously defined 'sum'
        .add({role: 'math', cmd: 'sum', integer: true },
            function( msg, respond ){
                this.act({
                    role: 'math',
                    cmd: 'sum',
                    left: Math.floor(msg.left),
                    right: Math.floor(msg.right)
                }, respond);
        })



        //Seneca service that multiplies 2 numbers
        .add({ role: 'math', cmd: 'product' },
            function( msg, respond ) {
                var product = msg.left * msg.right;
                respond( null, { answer: product } );
        })

        //Note the action pattern: it's defined in more convenient 'jsonic' format
        .add('role:math,cmd:product,integer:true',
            function( msg, respond ) {
                this.act({
                    role: 'math',
                    cmd: 'product',
                    left: Math.floor(msg.left),
                    right: Math.floor(msg.right)
                }, respond);
        });

//********************************************************************************//


//***************************** CALL SENECA SERVICES *****************************//
    //Call sum service. 'integer: true' version runs: the most specific match always wins
    seneca.act(
        { role: 'math', cmd: 'sum', left: 1, right: 2, integer: true,  },
        function( err, result ){
            if( err ) return console.error( err );
            console.log( result );
        });

    //Call multiplying service
    seneca.act(
        { role: 'math', cmd: 'sum', left: 1, right: 2 },
        function( err, result ){
            seneca.act(
                { role: 'math', cmd: 'product', left: result.answer, right: 4 },
                function( err, result ){
                    if( err ) return console.error( err );
                    console.log( result );
                }
            );
        }
    );

    //Call services in a chain
    seneca.act({ role: 'math', cmd: 'sum', left: 1, right: 5 }, consoleCatcher)
          .act({ role: 'math', cmd: 'product', left: 5, right: 8 }, consoleCatcher)
          .act({ role: 'math', cmd: 'sum', integer:true, left: 48, right: 21 }, consoleCatcher);
//********************************************************************************//

    return seneca;
}());