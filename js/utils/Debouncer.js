/*global dessert, troop, sntls, sntls */
/*global window */
troop.postpone(sntls, 'Debouncer', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend(),
        slice = Array.prototype.slice;

    /**
     * @name sntls.Debouncer.create
     * @function
     * @param {function} originalFunction Function to debounce
     * @returns {sntls.Debouncer}
     */

    /**
     * De-bounces a function. Calls to the specified function via .runDebounced will be rejected
     * by each subsequent call being made within the specified time frame.
     * @class
     * @extends troop.Base
     */
    sntls.Debouncer = self
        .addPrivateMethods(/** @lends sntls.Debouncer# */{
            /**
             * @param {function} func
             * @param {number} delay
             * @returns {number}
             * @private
             */
            _setTimeoutProxy: function (func, delay) {
                return window.setTimeout(func, delay);
            },

            /**
             * @param {number} timer
             * @private
             */
            _clearTimeoutProxy: function (timer) {
                return window.clearTimeout(timer);
            }
        })
        .addMethods(/** @lends sntls.Debouncer# */{
            /**
             * @param {function} originalFunction Function to debounce
             * @ignore
             */
            init: function (originalFunction) {
                dessert.isFunction(originalFunction, "Invalid original function");

                /** @type {function} */
                this.originalFunction = originalFunction;

                /** @type {number} */
                this.debounceTimer = undefined;
            },

            /**
             * @param {number} delay
             * @returns {sntls.Debouncer}
             */
            runDebounced: function (delay) {
                var debounceTimer = this.debounceTimer;

                if (debounceTimer) {
                    this._clearTimeoutProxy(debounceTimer);
                }

                var that = this,
                    args = slice.call(arguments, 1);

                this.debounceTimer = this._setTimeoutProxy(function () {
                    that.originalFunction.apply(that, args);
                    that.debounceTimer = undefined;
                }, delay);

                return this;
            }
        });
});

(function () {
    "use strict";

    troop.Properties.addProperties.call(
        Function.prototype,
        /** @lends Function# */{
            /**
             * Converts `Function` to `Debouncer` instance.
             * @returns {sntls.Debouncer}
             */
            toDebouncer: function () {
                return sntls.Debouncer.create(this);
            }
        },
        false, false, false);
}());
