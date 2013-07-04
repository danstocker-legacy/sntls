/*global dessert, troop, sntls */
troop.postpone(sntls, 'Stateful', function () {
    "use strict";

    /**
     * Trait.
     * Behavior that makes a class stateful by adding multiple layers of orthogonal state matrices.
     * Transitions in those matrices get associated with methods of the class.
     * @class sntls.Stateful
     * @extends troop.Base
     */
    sntls.Stateful = troop.Base.extend()
        .addMethods(/** @lends sntls.Stateful# */{
            /**
             * Initializes stateful instance by assigning default states for each layer
             * as the current state.
             */
            initStateful: function () {
                /**
                 * Collection holding current state names for each state layer.
                 * Key: name of state layer, value: name of current state for that layer.
                 * @type {sntls.Collection}
                 */
                this.currentStates = this.defaultStates.clone();

                return this;
            },

            /**
             * Retrieves name of the current state for the specified state layer.
             * @param {string} layerName
             * @returns {string}
             */
            currentState: function (layerName) {
                return this.currentStates.getItem(layerName);
            },

            /**
             * Adds an independent state layer to the class.
             * A state layer is a set of mutually exclusive states, eg. enabled-disabled, or open-closed.
             * @example
             * var MyStateful = troop.Base.extend()
             *  .addTrait(sntls.Stateful)
             *  .addStateLayer(
             *      'openClose',
             *      sntls.StateMatrix.create()
             *          .addEdge('open', 'closed', 'open') // MyStateful.open()
             *          .addEdge('closed', 'open', 'close'), // MyStateful.close()
             *      'closed' // default state
             *  )
             *  .addMethod({
             *      init: function () {
             *          this.initStateful();
             *      },
             *      open: function () { alert("Opening..."); },
             *      close: function () { alert("Closing..."); }
             *  });
             * @param {string} layerName Name of state layer. Layer will be referenced by this name
             * when accessing or changing states on instance.
             * @param {sntls.StateMatrix} stateMatrix State matrix instance. Load in this state matrix
             * represents method names for the stateful class.
             * @param {string} defaultState Default state for this layer.
             * @returns {sntls.Stateful}
             * @memberOf sntls.Stateful
             */
            addStateLayer: function (layerName, stateMatrix, defaultState) {
                dessert
                    .isString(layerName, "Invalid layer name")
                    .isStateMatrix(stateMatrix, "Invalid state matrix")
                    .isString(defaultState, "Invalid default state");

                if (!this.hasOwnProperty('stateMatrices')) {
                    this.addConstants(/** @lends sntls.Stateful# */{
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
             * Changes state on stateful instance from current state to destination state and
             * calls the method associated with the transition. The method receives no arguments, but is able
             * to prevent the transition by returning `false`.
             * @example
             * var myStateful = MyStateful.create();
             * myStateful.currentState('openClose') // 'closed', default state for this layer
             * myStateful.changeStateTo('open', 'openClose') // alerts "Opening..."
             * @param {string} stateName Name of destination state.
             * @param {string} layerName Name of selected state layer.
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
