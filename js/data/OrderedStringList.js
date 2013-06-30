/*global dessert, troop, sntls */
troop.postpone(sntls, 'OrderedStringList', function () {
    "use strict";

    /**
     * Instantiates class.
     * @name sntls.OrderedStringList.create
     * @function
     * @param {string[]} [items] Initial values
     * @returns {sntls.OrderedStringList}
     */

    /**
     * Ordered list of strings. Allows prefix-based search.
     * @class sntls.OrderedStringList
     * @extends sntls.OrderedList
     */
    sntls.OrderedStringList = sntls.OrderedList.extend()
        .addPrivateMethods(/** @lends sntls.OrderedStringList */{
            /**
             * Calculates range search end value for prefix search based on start value.
             * Increments char code on the string's last character.
             * @param {string} startValue
             * @returns {String} Calculated end value
             * @private
             */
            _getEndValue: function (startValue) {
                return startValue.slice(0, -1) + String.fromCharCode(startValue.substr(-1).charCodeAt(0) + 1);
            },

            /**
             * Returns lowest value string that is higher than the input.
             * @param {string} startValue
             * @returns {string}
             * @private
             */
            _getNextValue: function (startValue) {
                return startValue + String.fromCharCode(0);
            }
        })
        .addMethods(/** @lends sntls.OrderedStringList# */{
            /**
             * Retrieves a range of items that match the specified prefix.
             * @param {string} prefix
             * @param {boolean} [excludeOriginal=false] Whether to exclude `prefix` from the results
             * @returns {string[]}
             */
            getRangeByPrefix: function (prefix, excludeOriginal) {
                dessert
                    .assert(typeof prefix === 'string' && prefix.length > 0, "Empty prefix")
                    .isBooleanOptional(excludeOriginal);

                var startValue = excludeOriginal ?
                        this._getNextValue(prefix) :
                        prefix,
                    endValue = this._getEndValue(prefix);

                return this.getRange(startValue, endValue);
            },

            /**
             * Retrieves a range by prefix and wraps it in a Hash object.
             * @param {string} prefix
             * @param {boolean} [excludeOriginal=false] Whether to exclude `prefix` from the results
             * @returns {sntls.Hash}
             * @see sntls.OrderedList.getRange
             */
            getRangeByPrefixAsHash: function (prefix, excludeOriginal) {
                var range = this.getRangeByPrefix.apply(this, arguments);
                return sntls.Hash.create(range);
            },

            /**
             * Removes all occurrence of a specific string from the list.
             * @param {string} value
             * @returns {sntls.OrderedStringList}
             */
            removeEvery: function (value) {
                dessert.isString(value);
                this.removeRange(value, this._getNextValue(value));
                return this;
            }
        });
});

(function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash# */{
        /**
         * @returns {sntls.OrderedStringList}
         */
        toOrderedStringList: function () {
            return sntls.OrderedStringList.create(this.items);
        }
    });
}());
