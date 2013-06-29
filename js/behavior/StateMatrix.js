/**
 * State Matrix
 *
 * Stores information about transitions between states.
 */
/*global dessert, troop, sntls */
troop.postpone(sntls, 'StateMatrix', function () {
    "use strict";

    /**
     * @class sntls.StateMatrix
     * @extends troop.Base
     */
    sntls.StateMatrix = troop.Base.extend()
        .addMethods(/** @lends sntls.StateMatrix */{
            /**
             * @name sntls.StateMatrix.create
             * @returns {sntls.StateMatrix}
             */

            /**/
            init: function () {
                /**
                 * Edges in the state matrix.
                 * Each edge defines a start state, an end state, and a load.
                 * Therefore this object is two levels deep.
                 * @type {sntls.Tree}
                 * @example
                 * {"enabled":{"disabled":"disable"},"disabled":{"enabled":"enable"}}
                 */
                this.edges = sntls.Tree.create();
            },

            /**
             * Adds an edge to the edges buffer.
             * @param {string} startStateName
             * @param {string} endStateName
             * @param {string} load
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
             * Retrieves load for the edge specified by its start and end.
             * @param {string} startStateName
             * @param {string} endStateName
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
