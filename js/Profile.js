/**
 * Profile
 *
 * A profile is a collection of named numeric values that
 * may be incremented by an object the profile represents.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Profile', function (sntls) {
    var self = sntls.Profile = troop.Base.extend()
        .addMethod({
            /**
             * @constructor
             */
            init: function () {
                this.addPublic({
                    /**
                     * Lookup of numeric values assigned to named counter bins
                     * @type {object}
                     */
                    counters: {}
                });
            },

            /**
             * Increases counter
             * @param {string} counterName Counter identifier
             * @param {number} [amount] Amount to add to counter
             */
            inc: function (counterName, amount) {
                amount = amount || 1;

                var counters = this.counters;

                if (!counters.hasOwnProperty(counterName)) {
                    counters[counterName] = amount;
                } else {
                    counters[counterName] += amount;
                }

                return this;
            },

            /**
             * Decreases counter
             * @param {string} counterName Counter identifier
             * @param {number} [amount] Amount to add to counter
             */
            dec: function (counterName, amount) {
                amount = amount || 1;

                var counters = this.counters;

                if (!counters.hasOwnProperty(counterName)) {
                    counters[counterName] = 0 - amount;
                } else {
                    counters[counterName] -= amount;
                }

                return this;
            },

            /**
             * Retrieves counter value
             * @return {Number}
             */
            getCount: function (key) {
                return this.counters[key] || 0;
            },

            /**
             * Simple getter for counter object.
             * @return {object}
             */
            getCounters: function () {
                return this.counters;
            },

            /**
             * Resets one or all counters
             * @param {string} [key]
             */
            reset: function (key) {
                if (dessert.validators.isString(key)) {
                    delete this.counters[key];
                } else {
                    this.counters = {};
                }
            }
        });
});

/*global sntls */
dessert.addTypes({
    isProfile: function (expr) {
        return sntls.Profile.isPrototypeOf(expr);
    },

    isProfileOptional: function (expr) {
        return typeof expr === 'undefined' ||
               sntls.Profile.isPrototypeOf(expr);
    }
});
