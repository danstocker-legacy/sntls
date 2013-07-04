/*global dessert, troop, sntls */
troop.postpone(sntls, 'StateMatrix', function () {
    "use strict";

    /**
     * Initializes transition edges.
     * @name sntls.StateMatrix.create
     * @function
     * @returns {sntls.StateMatrix}
     */

    /**
     * Associates edges between named vertices with data load. Stores information about transitions between
     * named states of a class or instance.
     * @class sntls.StateMatrix
     * @extends troop.Base
     */
    sntls.StateMatrix = troop.Base.extend()
        .addMethods(/** @lends sntls.StateMatrix# */{
            /**
             * @ignore
             */
            init: function () {
                /**
                 * Edges in the state matrix.
                 * Each edge defines a start state, an end state, and a load.
                 * @example
                 * {"enabled":{"disabled":"disable"},"disabled":{"enabled":"enable"}}
                 * @type {sntls.Tree}
                 */
                this.edges = sntls.Tree.create();
            },

            /**
             * Assigns `load` to the transition between `startStateName` and `endStateName`.
             * Subsequent calls to `.addEdge()` with the same start and end names overwrite the associated load.
             * @example
             * var sm = sntls.StateMatrix.create()
             *  .addEdge('home', 'work', 'bus');
             * @param {string} startStateName Name of the state in which the transition starts.
             * @param {string} endStateName Name of the state in which the transition ends.
             * @param {string} load Data assigned to transition edge.
             * @returns {sntls.StateMatrix}
             */
            addEdge: function (startStateName, endStateName, load) {
                dessert
                    .isString(startStateName, "Invalid start state name")
                    .isString(endStateName, "Invalid end state name")
                    .isString(load, "Invalid load");

                this.edges.setNode([startStateName, endStateName].toPath(), load);

                return this;
            },

            /**
             * Retrieves the load associated with the transition specified by `startStateName` and `endStateName`,
             * or `undefined` when no load is assigned to the transition.
             * @example
             * sm.getLoad('home', 'work') // 'bus'
             * @param {string} startStateName Name of the state in which the transition starts.
             * @param {string} endStateName Name of the state in which the transition ends.
             * @returns {*}
             */
            getLoad: function (startStateName, endStateName) {
                dessert
                    .isString(startStateName, "Invalid start state name")
                    .isString(endStateName, "Invalid end state name");

                return this.edges.getNode([startStateName, endStateName].toPath());
            }
        });
});

troop.postpone(sntls, 'StateMatrixCollection', function () {
    "use strict";

    /**
     * @name sntls.StateMatrixCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {sntls.StateMatrixCollection}
     */

    /**
     * @name sntls.StateMatrixCollection#edges
     * @ignore
     */

    /**
     * @class sntls.StateMatrixCollection
     * @extends sntls.Collection
     * @extends sntls.StateMatrix
     */
    sntls.StateMatrixCollection = sntls.Collection.of(sntls.StateMatrix);
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isStateMatrix: function (expr) {
            return sntls.StateMatrix.isBaseOf(expr);
        }
    });
}());
