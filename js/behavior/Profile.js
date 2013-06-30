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
     * A profile is a collection of named numeric values that
     * may be incremented by an object the profile represents.
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
                 * Lookup of numeric values assigned to named counter bins
                 * @type {object}
                 */
                this.counters = {};
            },

            /**
             * Increases counter
             * @param {string} counterName Counter identifier
             * @param {number} [amount] Amount to add to counter
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
             * Decreases counter
             * @param {string} counterName Counter identifier
             * @param {number} [amount] Amount to add to counter
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
             * Retrieves counter value
             * @returns {Number}
             */
            getCount: function (key) {
                return this.counters[key] || 0;
            },

            /**
             * Simple getter for counter object.
             * @returns {object}
             */
            getCounters: function () {
                return this.counters;
            },

            /**
             * Resets one or all counters
             * @param {string} [key]
             * @returns {sntls.Profile}
             */
            reset: function (key) {
                if (dessert.validators.isString(key)) {
                    delete this.counters[key];
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
