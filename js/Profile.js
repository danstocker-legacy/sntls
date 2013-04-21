/**
 * Profile
 *
 * A profile is a collection of named numeric values that
 * may be incremented by an object the profile represents.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Profile', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class sntls.Profile
     * @extends troop.Base
     */
    sntls.Profile = troop.Base.extend()
        .addMethod(/** @lends sntls.Profile */{
            /**
             * @name sntls.Profile.create
             * @return {sntls.Profile}
             */

            /**
             */
            init: function () {
                this.addPublic(/** @lends sntls.Profile */{
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
             * @return {sntls.Profile}
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
             * @return {sntls.Profile}
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
             * @return {sntls.Profile}
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

troop.promise(sntls, 'ProfileCollection', function () {
    "use strict";

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
