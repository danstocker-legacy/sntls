/*global dessert, troop, sntls */
troop.postpone(sntls, 'TreeWalker', function () {
    "use strict";

    /**
     * @class sntls.TreeWalker
     * @extends troop.Base
     */
    sntls.TreeWalker = troop.Base.extend()
        .addMethods(/** @lends sntls.TreeWalker */{
            /**
             * @name sntls.TreeWalker.create
             * @return {sntls.TreeWalker}
             */

            /**
             * @param {function} handler
             */
            init: function (handler) {
                dessert.isFunction(handler, "Invalid walker handler");

                /**
                 * Handler to be called on each relevant node.
                 * Returning false interrupts traversal.
                 * @type {Function}
                 */
                this.handler = handler;

                /**
                 * Key currently being traversed
                 * @type {string}
                 */
                this.currentKey = undefined;

                /**
                 * Node currently being traversed
                 * @type {*}
                 */
                this.currentNode = undefined;

                /**
                 * Path currently being traversed
                 * @type {sntls.Path}
                 */
                this.currentPath = undefined;
            },

            /**
             * Resets walker state
             */
            reset: function () {
                this.currentKey = undefined;
                this.currentNode = undefined;
                this.currentPath = undefined;
                return this;
            }
        });
});
