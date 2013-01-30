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
             */
            inc: function (key) {
                var counters = this.counters;
                if (!counters.hasOwnProperty(key)) {
                    counters[key] = 1;
                } else {
                    counters[key]++;
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
});
