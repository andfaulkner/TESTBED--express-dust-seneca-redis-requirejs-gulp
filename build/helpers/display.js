"use strict";

module.exports = (function () {

    return {

        /**
         * obj-->console; lines marking start & end of obj surrounding
         * @param  {[type]} object     [description]
         * @param  {[type]} levels     [description]
         * @param  {[type]} showHidden [description]
         * @return {[type]}            [description]
         */
        object_highlighted: function object_highlighted(object, levels, showHidden) {
            console.log(mn + "\n" + "     ****&*&*&*&*&*&*&*&*&*&*&*****     ".green.bgWhite);
            console.dir(object, {
                showHidden: !!showHidden ? true : false,
                depth: typeof levels === 'number' && levels > 0 ? levels : 3
            });
            console.log(mn + "\n" + "     ****&*&*&*&*&*&*&*&*&*&*&*****     ".green.bgWhite);
        }
    };
})();