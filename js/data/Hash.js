/**
 * Hash Object
 *
 * General wrapper around objects to treat them as hash.
 * No `Object`-delegated methods on `.items` should be called as they may break code.
 * All methods that operate *on* `.items` should be implemented on `Hash`.
 *
 * Other `Hash`-based classes may delegate conversion methods to this class.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Hash', function () {
    "use strict";

    /**
     * @class sntls.Hash
     * @extends troop.Base
     */
    sntls.Hash = troop.Base.extend()
        .addMethod(/** @lends sntls.Hash */{
            /**
             * @name sntls.Hash.create
             * @return {sntls.Hash}
             */

            /**
             * @param {object} items Container for hash items.
             * Setter methods in derived classes should refer to this flag when
             * allowing write operations.
             */
            init: function (items) {
                dessert.isObjectOptional(items, "Invalid items");

                this.items = items || {};
            },

            /**
             * Retrieves all item keys.
             * @return {string[]}
             */
            getKeys: function () {
                return Object.keys(this.items);
            },

            /**
             * Retrieves item keys wrapped ina hash.
             * @return {sntls.Hash}
             */
            getKeysAsHash: function () {
                return sntls.Hash.create(Object.keys(this.items));
            },

            /**
             * Retrieves item values as an array.
             * @return {Array}
             */
            getValues: function () {
                var items = this.items,
                    keys = Object.keys(items),
                    result = [],
                    i;

                for (i = 0; i < keys.length; i++) {
                    result.push(items[keys[i]]);
                }

                return result;
            },

            /**
             * Retrieves item values wrapped in a hash.
             * @return {sntls.Hash}
             */
            getValuesAsHash: function () {
                return sntls.Hash.create(this.getValues());
            },

            /**
             * Clears items buffer.
             * @return {sntls.Hash}
             */
            clear: function () {
                this.items = this.items instanceof Array ? [] : {};
                return this;
            }
        });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isHash: function (expr) {
            return sntls.Hash.isBaseOf(expr);
        },

        isHashOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Hash.isBaseOf(expr);
        }
    });
}());
