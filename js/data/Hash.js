/*global dessert, troop, sntls */
troop.postpone(sntls, 'Hash', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * Instantiates class.
     * @name sntls.Hash.create
     * @function
     * @param {object} items Container for hash items.
     * @returns {sntls.Hash}
     */

    /**
     * General wrapper around objects to treat them as hash.
     * No `Object`-delegated methods on `.items` should be called as they may break code.
     * All methods that operate *on* `.items` should be implemented on `Hash`.
     * Other `Hash`-based classes may delegate conversion methods to this class.
     * @class sntls.Hash
     * @extends troop.Base
     */
    sntls.Hash = troop.Base.extend()
        .addMethods(/** @lends sntls.Hash# */{
            /**
             * @param {object} items Container for hash items.
             * @ignore
             */
            init: function (items) {
                dessert.isObjectOptional(items, "Invalid items");

                this.items = items || {};
            },

            /**
             * Retrieves the first key to be found in the Hash.
             * Not guaranteed to return the same key on subsequent
             * calls when the hash has more than 1 items.
             * @returns {string}
             */
            getFirstKey: function () {
                var items = this.items,
                    key;
                for (key in items) {
                    if (hOP.call(items, key)) {
                        return key;
                    }
                }
                return undefined;
            },

            /**
             * Retrieves all item keys.
             * @returns {string[]}
             */
            getKeys: function () {
                return Object.keys(this.items);
            },

            /**
             * Retrieves item keys wrapped ina hash.
             * @returns {sntls.Hash}
             */
            getKeysAsHash: function () {
                return sntls.Hash.create(Object.keys(this.items));
            },

            /**
             * Retrieves the first value to be found in the Hash.
             * Not guaranteed to return the same value on subsequent
             * calls when the hash has more than 1 items.
             * Doesn't necessarily correspond to the key returned by
             * `.getFirstKey`.
             * @returns {*}
             */
            getFirstValue: function () {
                var items = this.items,
                    key;
                for (key in items) {
                    if (hOP.call(items, key)) {
                        return items[key];
                    }
                }
                return undefined;
            },

            /**
             * Retrieves item values as an array.
             * @returns {Array}
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
             * @returns {sntls.Hash}
             */
            getValuesAsHash: function () {
                return sntls.Hash.create(this.getValues());
            },

            /**
             * Clears items buffer.
             * @returns {sntls.Hash}
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
