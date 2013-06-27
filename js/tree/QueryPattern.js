/*global dessert, troop, sntls */
troop.postpone(sntls, 'QueryPattern', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class sntls.QueryPattern
     * @extends troop.Base
     */
    sntls.QueryPattern = troop.Base.extend()
        .addConstants(/** @lends sntls.QueryPattern */{
            /**
             * Separates keys from values in string pattern
             * @type {string}
             */
            KEY_VALUE_SEPARATOR: '^',

            /**
             * Separates options within the key part of a string pattern
             * @type {string}
             */
            OPTION_SEPARATOR: '<',

            /**
             * Symbol matching all keys
             * @type {string}
             */
            WILDCARD_SYMBOL: '|',

            /**
             * Symbol indication skip mode during traversal
             * @type {string}
             */
            SKIP_SYMBOL: '\\',

            /**
             * Validates a symbol
             * @type {RegExp}
             */
            RE_SYMBOL_VALIDATOR: /\||\\/
        })
        .addPrivateMethods(/** @lends sntls.QueryPattern */{
            /**
             * URI decodes all items of an array.
             * @param {string[]} strings Array of strings
             * @return {string[]} Array w/ all strings within URI-encoded
             * @static
             * @private
             */
            _encodeURI: function (strings) {
                var result = [],
                    i;
                for (i = 0; i < strings.length; i++) {
                    result.push(encodeURI(strings[i]));
                }
                return result;
            },

            /**
             * URI decodes all items of an array.
             * @param {string[]} strings Array of URI-encoded strings
             * @return {string[]} Array w/ all strings URI-decoded
             * @static
             * @private
             */
            _decodeURI: function (strings) {
                var result = [],
                    i;
                for (i = 0; i < strings.length; i++) {
                    result.push(decodeURI(strings[i]));
                }
                return result;
            },

            /**
             * Parses string representation of pattern
             * @param {string} pattern
             * @returns {string|object}
             * @private
             * @static
             */
            _parseString: function (pattern) {
                var keyValue = pattern.split(this.KEY_VALUE_SEPARATOR),
                    key = keyValue[0],
                    result;

                // processing key part of pattern
                if (key === this.SKIP_SYMBOL) {
                    // skip pattern can't have other attributes
                    return {
                        symbol: key
                    };
                } else if (key === this.WILDCARD_SYMBOL) {
                    // key is a wildcard symbol, matching any key
                    result = {
                        symbol: key
                    };
                } else if (key.indexOf(this.OPTION_SEPARATOR) > -1) {
                    // optional keys matching those keys only
                    result = {
                        options: this._decodeURI(key.split(this.OPTION_SEPARATOR))
                    };
                } else if (keyValue.length === 1) {
                    // string literal key, no value
                    return decodeURI(key);
                } else {
                    // string literal key, has value
                    result = {
                        key: decodeURI(key)
                    };
                }

                // processing value part of pattern
                if (keyValue.length > 1) {
                    // pattern has value bundled
                    result.value = decodeURI(keyValue[1]);
                }

                return result;
            }
        })
        .addMethods(/** @lends sntls.QueryPattern */{
            /**
             * @param {string|object} pattern
             */
            init: function (pattern) {
                if (pattern instanceof Object) {
                    this.descriptor = pattern;
                } else if (typeof pattern === 'string') {
                    this.descriptor = this._parseString(pattern);
                }
            },

            /**
             * Creates string representation of pattern
             * @returns {string}
             */
            toString: function () {
                var descriptor = this.descriptor,
                    result;

                if (typeof descriptor === 'string') {
                    // descriptor is string literal (key only)
                    result = encodeURI(descriptor);
                } else if (descriptor instanceof Object) {
                    // adding key
                    if (hOP.call(descriptor, 'symbol')) {
                        // descriptor contains symbol
                        result = descriptor.symbol;
                    } else if (hOP.call(descriptor, 'options')) {
                        // descriptor contains key options
                        result = this._encodeURI(descriptor.options).join(this.OPTION_SEPARATOR);
                    } else if (hOP.call(descriptor, 'key')) {
                        // descriptor contains single key
                        result = encodeURI(descriptor.key);
                    }

                    // adding value
                    if (hOP.call(descriptor, 'value')) {
                        result += this.KEY_VALUE_SEPARATOR + encodeURI(descriptor.value);
                    }
                }

                return result;
            }
        });
});

troop.postpone(sntls, 'QueryPatternCollection', function () {
    "use strict";

    /**
     * @class sntls.QueryPatternCollection
     * @extends sntls.Collection
     * @extends sntls.QueryPattern
     */
    sntls.QueryPatternCollection = sntls.Collection.of(sntls.QueryPattern);
});
