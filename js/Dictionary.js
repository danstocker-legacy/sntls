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
    dessert.addTypes(/** @lends dessert */{
        isDictionary: function (expr) {
            return sntls.Dictionary.isBaseOf(expr);
        },

        isDictionaryOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Dictionary.isBaseOf(expr);
        }
    });

    /**
     * @class sntls.Dictionary
     * @extends troop.Base
     */
    sntls.Dictionary = troop.Base.extend()
        .addMethod(/** @lends sntls.Dictionary */{
            /**
             * @name sntls.Dictionary.create
             * @return {sntls.Dictionary}
             */

            /**
             * @param {object} items Initial dictionary items
             */
            init: function (items) {
                dessert.isObjectOptional(items, "Invalid initial dictionary items");

                this.addPublic(/** @lends sntls.Dictionary */{
                    /**
                     * @type {object}
                     */
                    items: items || {}
                });
            },

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
                } else {
                    dessert.assert(false, "Invalid key");
                }

                return result;
            },

            /**
             * Combines current dictionary with remote dictionary
             * @param {sntls.Dictionary} remoteDict Remote dictionary
             * @return {sntls.Dictionary} Combined dictionary
             */
            combineWith: function (remoteDict) {
                dessert.isDictionary(remoteDict, "Invalid dictionary");

                var result = this.getBase().create(),
                    currentKeys = Object.keys(this.items),
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
             * Reverses keys and values.
             * Values from array items end up as separate keys on the new dictionary,
             * and keys associated with the same values stack up in arrays.
             * @return {sntls.Dictionary} New dictionary instance with reversed key-value pairs.
             */
            reverse: function () {
                /**
                 * @type {sntls.Dictionary}
                 */
                var result = this.getBase().create(),
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
