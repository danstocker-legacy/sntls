/*global dessert, troop, sntls */
troop.postpone(sntls, 'TreeWalker', function () {
    "use strict";

    /**
     * Base class for tree walker classes.
     * Holds basic properties and state of the tree walker.
     * @class sntls.TreeWalker
     * @extends troop.Base
     */
    sntls.TreeWalker = troop.Base.extend()
        .addMethods(/** @lends sntls.TreeWalker# */{
            /**
             * @name sntls.TreeWalker.create
             * @function
             * @param {function} handler
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
             * @returns {sntls.TreeWalker}
             */
            reset: function () {
                this.currentKey = undefined;
                this.currentNode = undefined;
                this.currentPath = undefined;
                return this;
            }
        });
});
