/**
 * Dictionary
 *
 * Associates values to keys.
 *
 * Use the Dictionary class for managing and combining lookup objects.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Dictionary', function () {
    "use strict";

    /**
     * @class sntls.Dictionary
     * @extends sntls.Hash
     */
    sntls.Dictionary = sntls.Hash.extend()
        .addMethod(/** @lends sntls.Dictionary */{
            /**
             * @name sntls.Dictionary.create
             * @return {sntls.Dictionary}
             */

            /**
             * Adds item to dictionary
             * @param {string} key
             * @param {*|*[]} value
             * @return {sntls.Dictionary}
             */
            addItem: function (key, value) {
                var items = this.items,
                    currentValue = items[key];

                switch (typeof currentValue) {
                case 'undefined':
                    // current item does not exist
                    items[key] = value instanceof Array ?
                        value.length === 1 ?
                            value[0] :
                            value :
                        value;
                    break;

                case 'string':
                    // current item is single string
                    items[key] = value instanceof Array ?
                        [currentValue].concat(value) :
                        items[key] = [currentValue, value];
                    break;

                case 'object':
                    if (currentValue instanceof Array) {
                        // current item is array
                        if (value instanceof Array) {
                            items[key] = currentValue.concat(value);
                        } else {
                            currentValue.push(value);
                        }
                    } else {
                        dessert.assert(false, "Invalid dictionary value");
                    }
                    break;

                default:
                    dessert.assert(false, "Invalid dictionary value");
                    break;
                }

                return this;
            },

            /**
             * Adds items to dictionary by assigning the same value(s) to
             * a set of keys
             * @param {string[]} keys
             * @param {*|*[]} value
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
                    currentValueType = typeof currentValue,
                    valueIndex;

                if (currentValueType === 'string' ||
                    typeof value === 'undefined'
                    ) {
                    // removing full item
                    delete items[key];
                } else if (currentValue instanceof Array) {
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
                    }
                }

                return this;
            },

            /**
             * Removes items from dictionary.
             * @param {string[]} keys
             * @return {sntls.Dictionary}
             */
            removeItems: function (keys) {
                dessert.isArray(keys, "Invalid keys");

                var i;
                for (i = 0; i < keys.length; i++) {
                    this.removeItem(keys[i]);
                }
                return this;
            },

            /**
             * Retrieves item(s) from the dictionary
             * @param {*|*[]} key
             * @return {*|*[]} Dictionary item
             */
            getItem: function (key) {
                var result,
                    i, item;

                if (typeof key === 'string') {
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

    sntls.Hash.addMethod(/** @lends sntls.Hash */{
        /**
         * @return {sntls.Dictionary}
         */
        toDictionary: function () {
            return sntls.Dictionary.create(this.items);
        }
    });
}());
