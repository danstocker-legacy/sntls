/*global dessert, troop, sntls */
troop.postpone(sntls, 'QueryPattern', function () {
    "use strict";

    /**
     * @class sntls.QueryPattern
     * @extends troop.Base
     */
    sntls.QueryPattern = troop.Base.extend()
        .addConstants(/** @lends sntls.QueryPattern */{
            KEY_VALUE_SEPARATOR: '^',

            OPTION_SEPARATOR: '<',

            WILDCARD_SYMBOL: '|',

            SKIP_SYMBOL: '\\',

            RE_SYMBOL_VALIDATOR: /\||\\/
        })
        .addPrivateMethods(/** @lends sntls.QueryPattern */{
            /**
             * URI decodes all items of an array.
             * @param {string[]} strings Array of URI-encoded strings
             * @return {string[]} Array w/ all strings URI-decoded
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
            }
        });
});
