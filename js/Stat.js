/**
 * Statistic
 *
 * Class for collecting statistics
 */
/*global dessert, troop */
troop.promise('sntls.Stat', function (sntls, className) {
    var self = sntls.Stat = troop.Base.extend()
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
        isStat: function (expr) {
            return self.isPrototypeOf(expr);
        },

        isStatOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   self.isPrototypeOf(expr);
        }
    });
});
