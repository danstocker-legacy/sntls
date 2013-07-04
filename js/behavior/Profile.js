/*global dessert, troop, sntls */
troop.postpone(sntls, 'Profile', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * Instantiates class.
     * @name sntls.Profile.create
     * @function
     * @returns {sntls.Profile}
     */

    /**
     * Profiles register a set of counters that may be increased or decreased as a way of gathering statistics.
     * @class sntls.Profile
     * @extends troop.Base
     */
    sntls.Profile = troop.Base.extend()
        .addMethods(/** @lends sntls.Profile# */{
            /**
             * @ignore
             */
            init: function () {
                /**
                 * Registers individual named counters that make up the profile.
                 * @type {object}
                 */
                this.counters = {};
            },

            /**
             * Increases counter either by 1 or `amount` when specified.
             * @param {string} counterName Counter name.
             * @param {number} [amount=1] Amount by which the counter is to be increased.
             * @returns {sntls.Profile}
             */
            inc: function (counterName, amount) {
                amount = amount || 1;

                var counters = this.counters;

                if (!hOP.call(counters, counterName)) {
                    counters[counterName] = amount;
                } else {
                    counters[counterName] += amount;
                }

                return this;
            },

            /**
             * Decreases counter either by 1 or `amount` when specified.
             * @param {string} counterName Counter name.
             * @param {number} [amount] Amount by which the counter is to be decreased.
             * @returns {sntls.Profile}
             */
            dec: function (counterName, amount) {
                amount = amount || 1;

                var counters = this.counters;

                if (!hOP.call(counters, counterName)) {
                    counters[counterName] = 0 - amount;
                } else {
                    counters[counterName] -= amount;
                }

                return this;
            },

            /**
             * Retrieves the current value of the specified counter.
             * @param {string} counterName Counter name.
             * @returns {Number} Counter value.
             */
            getCount: function (counterName) {
                return this.counters[counterName] || 0;
            },

            /**
             * TODO: Remove when property accessor is implemented in sntls.Collection
             * Simple getter for counter object.
             * @deprecated
             * @returns {object}
             */
            getCounters: function () {
                return this.counters;
            },

            /**
             * Resets the profile by emptying the entire counters buffer, or just one counter.
             * @param {string} [counterName] Name of counter to be reset.
             * @returns {sntls.Profile}
             */
            reset: function (counterName) {
                if (dessert.validators.isString(counterName)) {
                    delete this.counters[counterName];
                } else {
                    this.counters = {};
                }
                return this;
            }
        });
});

troop.postpone(sntls, 'ProfileCollection', function () {
    "use strict";

    /**
     * @name sntls.ProfileCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {sntls.ProfileCollection}
     */

    /**
     * @name sntls.ProfileCollection#counters
     * @ignore
     */

    /**
     * @class sntls.ProfileCollection
     * @extends sntls.Collection
     * @extends sntls.Profile
     */
    sntls.ProfileCollection = sntls.Collection.of(sntls.Profile);
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isProfile: function (expr) {
            return sntls.Profile.isPrototypeOf(expr);
        },

        isProfileOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Profile.isPrototypeOf(expr);
        },

        isProfileCollection: function (expr) {
            return this.isClass(expr) &&
                   (expr.isA(sntls.Profile) ||
                    expr.isA(sntls.ProfileCollection));
        },

        isProfileCollectionOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   this.isClass(expr) &&
                   (expr.isA(sntls.Profile) ||
                    expr.isA(sntls.ProfileCollection));
        }
    });
}());
