/**
 * Stateful Trait
 *
 * Classes that have this trait may define orthogonal state layers.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Stateful', function () {
    /**
     * @class sntls.Stateful
     * @extends troop.Base
     */
    sntls.Stateful = troop.Base.extend()
        .addMethod(/** @lends sntls.Stateful */{
            /**
             * Adds properties required by trait.
             */
            initStateful: function () {
                this.addPublic(/** @lends sntls.Stateful */{
                    /**
                     * (Unspecified) collection of strings
                     * Stores current state names for each state layer
                     * @type {sntls.Collection}
                     */
                    currentStates: sntls.Collection.create()
                });
            },

            /**
             * Adds a state layer.
             * A state layer is a set of mutually exclusive states,
             * eg. enabled-disabled, or open-closed.
             * @param {string} layerName
             * @param {sntls.StateMatrix} stateMatrix
             * @return {sntls.Stateful}
             * @static
             */
            addStateLayer: function (layerName, stateMatrix) {
                dessert
                    .isString(layerName)
                    .isStateMatrix(stateMatrix);

                if (!this.hasOwnProperty('stateMatrices')) {
                    this.addConstant(/** @lends sntls.Stateful */{
                        /**
                         * @type {sntls.StateMatrixCollection}
                         */
                        stateMatrices: sntls.StateMatrixCollection.create()
                    });
                }

                // setting state matrix as layer
                this.stateMatrices.setItem(layerName, stateMatrix);

                return this;
            },

            /**
             * Changes state on specified state layer.
             * @param {string} stateName Destination state
             * @param {string} layerName Layer name
             * @return {sntls.Stateful}
             */
            changeStateTo: function (stateName, layerName) {
                dessert.isString(layerName);

                var currentStateName = this.currentStates.getItem(layerName),
                    methodName;

                if (currentStateName) {
                    methodName = this.stateMatrices.getItem(layerName)
                        .getLoad(currentStateName, stateName);
                }

                // calling handler and changing state
                if (!methodName || this[methodName]() !== false) {
                    this.currentStates.setItem(layerName, stateName);
                }

                return this;
            }
        });
});