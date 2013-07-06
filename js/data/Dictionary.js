/*global dessert, troop, sntls */
troop.postpone(sntls, 'Dictionary', function () {
    "use strict";

    var base = sntls.Hash;

    /**
     * Instantiates class.
     * Constructs a dictionary, initialized with the items passed in the optional argument.
     * @name sntls.Dictionary.create
     * @function
     * @param {object} [items]
     * @returns {sntls.Dictionary}
     */

    /**
     * Manages key-value pairs. In a dictionary, one item is equivalent to a key-value pair.
     * Internally, `Dictionary` stores key-value pairs in an object hash, its keys being dictionary keys,
     * associated with values or arrays of values.
     * @class sntls.Dictionary
     * @extends sntls.Hash
     */
    sntls.Dictionary = base.extend()
        .addPrivateMethods(/** @lends sntls.Dictionary */{
            /**
             * Counts values in dictionary.
             * Since one item may hold multiple values, value count =/= item count.
             * @param {object} dictionaryItems Dictionary item buffer
             * @returns {number}
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
        .addMethods(/** @lends sntls.Dictionary# */{
            /**
             * TODO: Rename "itemCount" to "keyCount" and "valueCount" to "itemCount" in accordance w/ naming conventions.
             * @param {object} [items]
             * @ignore
             */
            init: function (items) {
                base.init.call(this, items);

                /**
                 * Number of items in the dictionary. Equal to the number of keys.
                 * Should not be modified externally.
                 * @example
                 * sntls.Dictionary.create({foo:"bar",baz:[1,2]}).itemCount // 2 (foo, baz)
                 * @type {number}
                 */
                this.itemCount = items ? Object.keys(items).length : 0;

                /**
                 * Reflects the number of values (with multiplicity) in the dictionary.
                 * Should not be modified externally.
                 * @example
                 * sntls.Dictionary.create({foo:"bar",baz:[1,2]}).valueCount // 3 ("bar", 1, 2)
                 * @type {number}
                 */
                this.valueCount = items ? this._countValues(items) : 0;
            },

            /**
             * Adds key-value pairs to dictionary, where one key, and multiple values may be specified.
             * @example
             * var d = sntls.Dictionary.create({foo: "bar"});
             * d.addItem('hello', 'world').items // {foo: "bar", hello: "world"}
             * d.addItem('foo', 'boo').items // {foo: ["bar", "boo"], hello: "world"}
             * @param {string} key Single dictionary key.
             * @param {*|Array} value Value or values to be assigned to the specified key.
             * @returns {sntls.Dictionary}
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
             * Adds key-value pairs to the dictionary, where multiple keys and values may be specified.
             * All specified keys will be assigned each value listed in `value`.
             * @example
             * var d = sntls.Dictionary.create();
             * d.addItems(['hello', 'greetings'], 'world').items // {hello: "world", greetings: "world"}
             * d.addItem(['foo', 'hello'], 'bar').items // {hello: ["world", "bar"], greetings: "world", foo: "bar"}
             * @param {string[]} keys Array of keys.
             * @param {*|Array} value Value or values to be assigned to the specified keys.
             * @returns {sntls.Dictionary}
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
             * Removes single key-value pair from dictionary. When `value` is omitted all items matched by `key`
             * will be removed from the dictionary.
             * @example
             * var d = sntls.Dictionary.create({
             *     foo: 'bar',
             *     hello: ['world', 'all', 'bar']
             * });
             * d.removeItem('hello', 'bar').items // {foo: 'bar', hello: ['world', 'all']}
             * @param {string} key Key identifying a dictionary item.
             * @param {*} [value] Value (by reference if object) to be removed from the item.
             * @returns {sntls.Dictionary}
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
             * Removes key-value pairs from dictionary matching `value` and any of the keys listed in `key`.
             * When `value` is omitted, all items matching any of `keys` will be removed.
             * @param {string[]} keys Array of keys.
             * @param {*} [value] Value (by reference if object).
             * @returns {sntls.Dictionary}
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
             * Retrieves the value or values associated with `key`.
             * TODO: make sure single key / array value returns a copy of the array
             * @param {*|Array} key Array of keys matching dictionary items.
             * @returns {*|Array} Array of values matching the specified key(s).
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
             * Clears dictionary and resets counters.
             * @returns {sntls.Dictionary}
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

    sntls.Hash.addMethods(/** @lends sntls.Hash# */{
        /**
         * Reinterprets hash as a dictionary.
         * @returns {sntls.Dictionary}
         */
        toDictionary: function () {
            return sntls.Dictionary.create(this.items);
        }
    });
}());
