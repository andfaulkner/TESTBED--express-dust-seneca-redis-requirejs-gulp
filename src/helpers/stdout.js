/**
 * @module stdout
 * @description utilitites for outputting data to the console
 */

module.exports = (function stdout(){

    var colors = require('colors');

    var storedModuleName;

    return ({

        /**
         * Output colouredModuleName
         * @param  {String} moduleName module nm; defaults to prev given module nm
         * @return {[type]}            [description]
         */
        moduleColour: function moduleColour(moduleName){
            var storedModuleName = (!!moduleName) ?
                moduleName : storedModuleName;
            return; // INCOMPLETE!!!!
        },

        /**
         * obj-->console; lines marking start & end of obj surrounding
         * @param  {Object} object      object to display
         * @param  {String} moduleNm    name of originating module
         * @param  {[type]} levels      [description]
         * @param  {[type]} showHidden  [description]
         * @return {[type]}             [description]
         */
        object_highlighted: function object_highlighted(object, moduleNm, levels, showHidden){

            moduleNm = moduleNm ? moduleNm : "";

            console.log("____**************&*&*&*&*&*&*&*&*&*&*&***************____"
                .magenta.bgWhite);
            console.log("     ****&*&*&*&*&*&*&*&*&*&*&*****     "
                .green.bgWhite);
            console.log(moduleNm + "\n     ****&*&*&*&*&*&*&*&*&*&*&*****     "
                .green.bgWhite);

            console.dir(object, {
                showHidden: (!!showHidden) ? true : false,
                depth: (typeof levels === 'number' && levels > 0) ? levels : 3
            });

             console.log("____**************&*&*&*&*&*&*&*&*&*&*&***************____"
                .magenta.bgWhite);
      }
    });

}());