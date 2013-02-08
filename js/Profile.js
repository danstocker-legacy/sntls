/**
 * Profile
 *
 * A profile is a collection of named numeric values that
 * may be incremented by an object the profile represents.
 */
/*global dessert, troop */
troop.promise('sntls.Profile', function (sntls, className) {
    var self = sntls.Profile = troop.Base.extend()
        .addMethod({
            /**
             * @constructor
             */
            init: function () {
                this.addConstant({
                    /**
                     * Lookup of numeric values assigned to named counter bins
                     * @type {object}
                     */
                    counters: {}
                });
            },

            /**
             * Increases counter
             * @param counterName {string} Counter identifier
             * @param [amount] {number} Amount to add to counter
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
             * Retrieves counter value
             */
            counter: function (key) {
                return this.counters[key];
            }
        });

    dessert.addTypes({
        isProfile: function (expr) {
            return self.isPrototypeOf(expr);
        },

        isProfileOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   self.isPrototypeOf(expr);
        }
    });
});
