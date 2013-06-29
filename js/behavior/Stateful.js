/**
 * Stateful Trait
 *
 * Classes that have this trait may define orthogonal state layers.
 */
/*global dessert, troop, sntls */
troop.postpone(sntls, 'Stateful', function () {
    "use strict";

    /**
     * @class sntls.Stateful
     * @extends troop.Base
     */
    sntls.Stateful = troop.Base.extend()
        .addMethods(/** @lends sntls.Stateful */{
            /**
             * Adds properties required by trait.
             */
            initStateful: function () {
                /**
                 * (Unspecified) collection of strings
                 * Stores current state names for each state layer
                 * @type {sntls.Collection}
                 */
                this.currentStates = this.defaultStates.clone();

                return this;
            },

            /**
             * Retrieves current state name for the specified layer.
             * @param {string} layerName
             * @returns {string}
             */
            currentState: function (layerName) {
                return this.currentStates.getItem(layerName);
            },

            /**
             * Adds a state layer.
             * A state layer is a set of mutually exclusive states,
             * eg. enabled-disabled, or open-closed.
             * @param {string} layerName Name of new state layer.
             * @param {sntls.StateMatrix} stateMatrix State matrix describing transitions.
             * @param {string} defaultState Default state for this layer.
             * @returns {sntls.Stateful}
             * @static
             */
            addStateLayer: function (layerName, stateMatrix, defaultState) {
                dessert
                    .isString(layerName, "Invalid layer name")
                    .isStateMatrix(stateMatrix, "Invalid state matrix")
                    .isString(defaultState, "Invalid default state");

                if (!this.hasOwnProperty('stateMatrices')) {
                    this.addConstants(/** @lends sntls.Stateful */{
                        /**
                         * Associates layer names with default state names.
                         * @type {sntls.Collection}
                         */
                        defaultStates: sntls.Collection.create(),

                        /**
                         * Associates layer names with state matrices.
                         * @type {sntls.StateMatrixCollection}
                         */
                        stateMatrices: sntls.StateMatrixCollection.create()
                    });
                }

                // setting state matrix as layer
                this.stateMatrices.setItem(layerName, stateMatrix);

                // setting default state for layer
                this.defaultStates.setItem(layerName, defaultState);

                return this;
            },

            /**
             * Changes state on specified state layer.
             * @param {string} stateName Destination state
             * @param {string} layerName Layer name
             * @returns {sntls.Stateful}
             */
            changeStateTo: function (stateName, layerName) {
                dessert.isString(layerName, "Invalid layer name");

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
