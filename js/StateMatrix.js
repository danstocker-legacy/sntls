/**
 * State Matrix
 *
 * Stores information about transitions between states.
 */
/* global dessert, troop, sntls */
troop.promise(sntls, 'StateMatrix', function () {
    /**
     * @class sntls.StateMatrix
     * @extends troop.Base
     */
    sntls.StateMatrix = troop.Base.extend()
        .addMethod(/** @lends sntls.StateMatrix */{
            init: function () {
                this.addConstant(/** @lends sntls.StateMatrix */{
                    /**
                     * Edges in the state matrix.
                     * Each edge defines a start state, an end state, and a load.
                     * Therefore this object is two levels deep.
                     * @type {object}
                     * @example
                     * {"enabled":{"disabled":"disable"},"disabled":{"enabled":"enable"}}
                     */
                    edges: {}
                });
            },

            /**
             * Adds an edge to the edges buffer.
             * @param {string} startStateName
             * @param {string} endStateName
             * @param {string} load
             */
            addEdge: function (startStateName, endStateName, load) {
                dessert
                    .isString(startStateName)
                    .isString(endStateName)
                    .isString(load);

                var startVertices = this.edges,
                    endVertices = startVertices[startStateName];
                if (!endVertices) {
                    endVertices = startVertices[startStateName] = {};
                }
                if (!endVertices[endStateName]) {
                    endVertices[endStateName] = load;
                }
                return this;
            },

            /**
             * Retrieves load for the edge specified by its start and end.
             * @param {string} startStateName
             * @param {string} endStateName
             */
            getLoad: function (startStateName, endStateName) {
                dessert
                    .isString(startStateName)
                    .isString(endStateName);

                var endVertices = this.edges[startStateName];
                if (!endVertices) {
                    return undefined;
                } else {
                    return endVertices[endStateName];
                }
            }
        });
});

dessert.addTypes(/** @lends dessert */{
    isStateMatrix: function (expr) {
        return sntls.StateMatrix.isBaseOf(expr);
    }
});

troop.promise(sntls, 'StateMatrixCollection', function () {
    /**
     * @class sntls.StateMatrixCollection
     * @extends sntls.Collection
     * @borrows sntls.StateMatrix
     */
    sntls.StateMatrixCollection = sntls.Collection.of(sntls.StateMatrix);
});
