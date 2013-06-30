/*global dessert, troop, sntls */
troop.postpone(sntls, 'StringDictionary', function () {
    "use strict";

    /**
     * Instantiates class.
     * @name sntls.StringDictionary.create
     * @function
     * @param {object} items
     * @returns {sntls.StringDictionary}
     */

    /**
     * Specific data structure that is essentially an object
     * with properties that are either strings or arrays of strings.
     * Base class `Dictionary` handles multiplicity.
     * @example
     * {foo: 'bar', 'hello': ['all', 'the', 'world']}
     * @class sntls.StringDictionary
     * @extends sntls.Dictionary
     */
    sntls.StringDictionary = sntls.Dictionary.extend()
        .addMethods(/** @lends sntls.StringDictionary# */{
            /**
             * Combines current dictionary with remote dictionary
             * @param {sntls.Dictionary} remoteDict Remote dictionary (doesn't have to be string dictionary)
             * @returns {sntls.Dictionary} New dictionary instance with combined items
             */
            combineWith: function (remoteDict) {
                dessert.isDictionary(remoteDict, "Invalid dictionary");

                var items = this.items,
                    resultBuffer = items instanceof Array ? [] : {},
                    result = /** @type {sntls.Dictionary} */ remoteDict.getBase().create(resultBuffer),
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
             * @returns {sntls.StringDictionary} New dictionary instance with combined items
             */
            combineWithSelf: function () {
                return /** @type sntls.StringDictionary */ this.combineWith(this);
            },

            /**
             * Reverses keys and values.
             * Values from array items end up as separate keys on the new dictionary,
             * and keys associated with the same values stack up in arrays.
             * @param {function} [bufferType=Object] Constructor function specifying buffer type
             * for result dictionary (Array or Object)
             * @returns {sntls.StringDictionary} New dictionary instance with reversed key-value pairs.
             */
            reverse: function (bufferType) {
                dessert.isFunctionOptional(bufferType, "Invalid buffer type");

                var resultBuffer = bufferType === Array ? [] : {},
                    result = this.getBase().create(resultBuffer),
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

            /**
             * @name sntls.StringDictionary.clear
             * @function
             * @returns {sntls.StringDictionary}
             */
        });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isStringDictionary: function (expr) {
            return sntls.StringDictionary.isBaseOf(expr);
        },

        isStringDictionaryOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.StringDictionary.isBaseOf(expr);
        }
    });

    sntls.Hash.addMethods(/** @lends sntls.Hash# */{
        /**
         * @returns {sntls.StringDictionary}
         */
        toStringDictionary: function () {
            return sntls.StringDictionary.create(this.items);
        }
    });
}());
