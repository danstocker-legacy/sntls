/*global dessert, troop, Q, sntls */
/*jshint browser:true, node:true */
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
     * De-bounces a function. Calls to the specified function via .runDebounced will be ignored
     * and replaced by subsequent calls being made within the specified time frame.
     * When no new calls were made in the specified time frame, the last call will go through.
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
                return setTimeout(func, delay);
            },

            /**
             * @param {number} timer
             * @private
             */
            _clearTimeoutProxy: function (timer) {
                return clearTimeout(timer);
            }
        })
        .addMethods(/** @lends sntls.Debouncer# */{
            /**
             * @param {function} originalFunction Function to debounce
             * @ignore
             */
            init: function (originalFunction) {
                dessert.isFunction(originalFunction, "Invalid original function");

                /**
                 * Function to be de-bounced.
                 * @type {function}
                 */
                this.originalFunction = originalFunction;

                /**
                 * Internal timer identifier for the de-bounce process.
                 * @type {number}
                 */
                this.debounceTimer = undefined;

                /**
                 * Internal deferred object that gets resolved when the de-bounce sequence completes.
                 * @type {Q.Deferred}
                 */
                this.debounceDeferred = undefined;
            },

            /**
             * Runs the original function de-bounced with the specified delay.
             * @param {number} [delay]
             * @returns {Q.Promise}
             */
            runDebounced: function (delay) {
                delay = delay || 0;

                var debounceTimer = this.debounceTimer;

                if (debounceTimer) {
                    // clearing previous timeout
                    this._clearTimeoutProxy(debounceTimer);
                }

                if (!this.debounceDeferred) {
                    // creating deferred object for new debounce sequence
                    this.debounceDeferred = Q.defer();
                }

                var that = this,
                    args = slice.call(arguments, 1);

                this.debounceTimer = this._setTimeoutProxy(function () {
                    var result = that.originalFunction.apply(that, args);

                    // resolving returned promise
                    that.debounceDeferred.resolve(result);

                    // clearing debouncer state
                    that.debounceTimer = undefined;
                    that.debounceDeferred = undefined;
                }, delay);

                return this.debounceDeferred.promise;
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
