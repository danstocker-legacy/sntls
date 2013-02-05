/**
 * Statistic
 *
 * Class for collecting statistics
 */
/*global dessert, troop */
troop.promise('sntls.Stat', function (sntls, className) {
    var base = troop.Base,
        self;

    self = sntls.Stat = base.extend()
        .addMethod({
            /**
             * @constructor
             */
            init: function () {
                this.addConstant({
                    counters: {}
                });
            },

            /**
             * Increases counter
             * @param key {string} Counter key
             * @param [amount] {number} Amount to add to counter
             */
            inc: function (key, amount) {
                amount = amount || 1;

                var counters = this.counters;

                if (!counters.hasOwnProperty(key)) {
                    counters[key] = amount;
                } else {
                    counters[key] += amount;
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
