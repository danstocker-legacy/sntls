/**
 * Dictionary
 *
 * Associates values to keys.
 *
 * Use the Dictionary class for managing and combining lookup objects.
 */
/*global dessert, troop, sntls */
troop.postpone(sntls, 'Dictionary', function () {
    "use strict";

    var base = sntls.Hash;

    /**
     * @class sntls.Dictionary
     * @extends sntls.Hash
     */
    sntls.Dictionary = base.extend()
        .addPrivateMethods(/** @lends sntls.Dictionary */{
            /**
             * Counts values in dictionary.
             * Since one item may hold multiple values, value count =/= item count.
             * @param {object} dictionaryItems Dictionary item buffer
             * @return {number}
             * @private
             */
            _countValues: function (dictionaryItems) {
                var keys = Object.keys(dictionaryItems),
                    result = 0,
                    i, item;

                for (i = 0; i < keys.length; i++) {
                    item = dictionaryItems[keys[i]];
                    result += item instanceof Array ?
                        item.length :
                        1;
                }

                return result;
            }
        })
        .addMethods(/** @lends sntls.Dictionary */{
            /**
             * @name sntls.Dictionary.create
             * @return {sntls.Dictionary}
             */

            /**
             * @param {object} items
             */
            init: function (items) {
                base.init.call(this, items);

                /**
                 * Item count.
                 * @type {number}
                 */
                this.itemCount = items ? Object.keys(items).length : 0;

                /**
                 * Value count.
                 * @type {number}
                 */
                this.valueCount = items ? this._countValues(items) : 0;
            },

            /**
             * Adds item to dictionary
             * @param {string} key
             * @param {*|Array} value
             * @return {sntls.Dictionary}
             */
            addItem: function (key, value) {
                var items = this.items,
                    currentValue = items[key],
                    currentValueType = typeof currentValue,
                    valueIsArray = value instanceof Array;

                if (currentValue instanceof Array) {
                    // current item is array
                    if (valueIsArray) {
                        items[key] = currentValue.concat(value);
                    } else {
                        currentValue.push(value);
                    }
                } else if (currentValueType === 'undefined') {
                    // current item does not exist
                    items[key] = valueIsArray ?
                        value.length === 1 ?
                            value[0] :
                            value :
                        value;

                    // updating item count (new key was added)
                    this.itemCount++;
                } else {
                    // current item is single value
                    items[key] = valueIsArray ?
                        [currentValue].concat(value) :
                        [currentValue, value];
                }

                // updating value count
                this.valueCount += valueIsArray ?
                    value.length :
                    1;

                return this;
            },

            /**
             * Adds items to dictionary by assigning the same value(s) to
             * a set of keys
             * @param {string[]} keys
             * @param {*|Array} value
             * @return {sntls.Dictionary}
             */
            addItems: function (keys, value) {
                dessert.isArray(keys, "Invalid keys");

                var i;
                for (i = 0; i < keys.length; i++) {
                    this.addItem(keys[i], value);
                }
                return this;
            },

            /**
             * Removes key - value pair from dictionary. When item value is omitted,
             * all values associated with `key` are removed.
             * @param {string} key Key from which to remove value
             * @param {*} [value] Item value.
             * @return {sntls.Dictionary}
             */
            removeItem: function (key, value) {
                var items = this.items,
                    currentValue = items[key],
                    currentValueIsArray = currentValue instanceof Array,
                    valueIndex;

                if (currentValueIsArray && typeof value !== 'undefined') {
                    valueIndex = currentValue.indexOf(value);
                    if (valueIndex > -1) {
                        // value is present at specified key
                        if (currentValue.length > 2) {
                            // splicing out value from array
                            currentValue.splice(valueIndex, 1);
                        } else {
                            // replacing array with remaining value
                            items[key] = currentValue[1 - valueIndex];
                        }

                        // updating value counter
                        this.valueCount--;
                    }
                } else {
                    // removing full item
                    delete items[key];

                    // updating counters
                    this.itemCount--;
                    this.valueCount -= currentValueIsArray ?
                        currentValue.length :
                        1;
                }

                return this;
            },

            /**
             * Removes items from dictionary.
             * @param {string[]} keys
             * @param {*} [value]
             * @return {sntls.Dictionary}
             */
            removeItems: function (keys, value) {
                dessert.isArray(keys, "Invalid keys");

                var i;
                for (i = 0; i < keys.length; i++) {
                    this.removeItem(keys[i], value);
                }
                return this;
            },

            /**
             * Retrieves item(s) from the dictionary
             * @param {*|Array} key
             * @return {*|Array} Dictionary item
             */
            getItem: function (key) {
                var result,
                    i, item;

                if (typeof key === 'string' ||
                    typeof key === 'number'
                    ) {
                    result = this.items[key];
                } else if (key instanceof Array) {
                    // key may be an array of keys
                    result = [];
                    for (i = 0; i < key.length; i++) {
                        item = this.items[key[i]];
                        if (item) {
                            result = result.concat(item);
                        }
                    }
                    if (!result.length) {
                        result = undefined;
                    }
                } else {
                    dessert.assert(false, "Invalid key");
                }

                return result;
            },

            /**
             * Clears dictionary
             * @return {sntls.Dictionary}
             */
            clear: function () {
                // clearing items buffer
                base.clear.call(this);

                // resetting counters
                this.itemCount = 0;
                this.valueCount = 0;

                return this;
            }
        });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isDictionary: function (expr) {
            return sntls.Dictionary.isBaseOf(expr);
        },

        isDictionaryOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Dictionary.isBaseOf(expr);
        }
    });

    sntls.Hash.addMethods(/** @lends sntls.Hash */{
        /**
         * @return {sntls.Dictionary}
         */
        toDictionary: function () {
            return sntls.Dictionary.create(this.items);
        }
    });
}());
