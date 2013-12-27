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
     * Ordered list extended with string-specific fast, prefix-based search.
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
             * Retrieves items from the list matching the specified prefix.
             * @example
             * var osl = sntls.OrderedStringList(['hi', 'hello', 'hire', 'foo']);
             * osl.getRangeByPrefix('hi') // ['hi', 'hire']
             * osl.getRangeByPrefix('h') // ['hello', 'hi', 'hire']
             * @param {string} prefix Prefix to be matched by list items.
             * @param {boolean} [excludeOriginal=false] Whether to exclude `prefix` from the results
             * @param {number} [offset=0] Number of items to skip at start.
             * @param {number} [limit=Infinity] Number of items to fetch at most.
             * @returns {string[]} Sorted array of matches.
             */
            getRangeByPrefix: function (prefix, excludeOriginal, offset, limit) {
                dessert
                    .assert(typeof prefix === 'string' && prefix.length > 0, "Empty prefix")
                    .isBooleanOptional(excludeOriginal);

                var startValue = excludeOriginal ?
                        this._getNextValue(prefix) :
                        prefix,
                    endValue = this._getEndValue(prefix);

                return this.getRange(startValue, endValue, offset, limit);
            },

            /**
             * Retrieves items from the list matching the specified prefix, wrapped in a hash.
             * @param {string} prefix Prefix to be matched by list items.
             * @param {boolean} [excludeOriginal=false] Whether to exclude `prefix` from the results
             * @param {number} [offset=0] Number of items to skip at start.
             * @param {number} [limit=Infinity] Number of items to fetch at most.
             * @returns {sntls.Hash}
             * @see sntls.OrderedList#getRange
             */
            getRangeByPrefixAsHash: function (prefix, excludeOriginal, offset, limit) {
                var range = this.getRangeByPrefix.apply(this, arguments);
                return sntls.Hash.create(range);
            },

            /**
             * Removes all occurrences of a specific string from the list.
             * @example
             * var osl = sntls.OrderedStringList(['hi', 'hello', 'hire', 'hi', 'foo']);
             * osl.removeAll('hi').items // ['hello', 'hire', 'foo']
             * @param {string} value String value to be removed from list.
             * @returns {sntls.OrderedStringList}
             */
            removeEvery: function (value) {
                dessert.isString(value);
                this.removeRange(value, this._getNextValue(value));
                return this;
            }
        });
});

troop.amendPostponed(sntls, 'Hash', function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash# */{
        /**
         * Reinterprets hash as ordered string list.
         * @returns {sntls.OrderedStringList}
         */
        toOrderedStringList: function () {
            return sntls.OrderedStringList.create(this.items);
        }
    });
});

(function () {
    "use strict";

    troop.Properties.addProperties.call(
        Array.prototype,
        /** @lends Array# */{
            /**
             * Creates a new OrderedStringList instance based on the current array.
             * @returns {sntls.OrderedStringList}
             */
            toOrderedStringList: function () {
                return sntls.OrderedStringList.create(this);
            }
        },
        false, false, false
    );
}());
