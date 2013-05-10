/**
 * Dictionary
 *
 * Specific data structure that is essentially an object
 * with properties that are either strings or arrays of strings.
 * Example:  {foo: 'bar', 'hello': ['all', 'the', 'world']}
 * Dictionary handles multiplicity.
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
             * @param {string|string[]} value
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
             * @param {string|string[]} value
             * @return {sntls.Dictionary}
             */
            addItems: function (keys, value) {
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
             * @param {string} [value] Item value.
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
             * @param {string|string[]} key
             * @return {string|string[]} Dictionary item
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
            },

            /**
             * Combines current dictionary with remote dictionary
             * @param {sntls.Dictionary} remoteDict Remote dictionary
             * @return {sntls.Dictionary} New dictionary instance with combined items
             */
            combineWith: function (remoteDict) {
                dessert.isDictionary(remoteDict, "Invalid dictionary");

                var items = this.items,
                    resultBuffer = items instanceof Array ? [] : {},
                    result = /** @type {sntls.Dictionary} */ this.getBase().create(resultBuffer),
                    currentKeys = Object.keys(items),
                    i, currentKey, currentValue, remoteValue;

                for (i = 0; i < currentKeys.length; i++) {
                    currentKey = currentKeys[i];
                    currentValue = this.getItem(currentKey);
                    remoteValue = remoteDict.getItem(currentValue);

                    if (typeof remoteValue !== 'undefined') {
                        result.addItem(currentKey, remoteValue);
                    }
                }

                return result;
            },

            /**
             * Performs combine with current dictionary as remote dictionary too.
             * @return {sntls.Dictionary} New dictionary instance with combined items
             */
            combineWithSelf: function () {
                return this.combineWith(this);
            },

            /**
             * Reverses keys and values.
             * Values from array items end up as separate keys on the new dictionary,
             * and keys associated with the same values stack up in arrays.
             * @return {sntls.Dictionary} New dictionary instance with reversed key-value pairs.
             */
            reverse: function () {
                var result = /** @type {sntls.Dictionary} */ this.getBase().create(),
                    keys = Object.keys(this.items),
                    i, key, value;

                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    value = this.items[key];

                    // flipping value and key in new dictionary
                    if (value instanceof Array) {
                        result.addItems(value, key);
                    } else {
                        result.addItem(value, key);
                    }
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
