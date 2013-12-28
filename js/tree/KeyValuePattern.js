/*global dessert, troop, sntls */
troop.postpone(sntls, 'KeyValuePattern', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        validators = dessert.validators;

    /**
     * Instantiates class
     * @name sntls.KeyValuePattern.create
     * @function
     * @param {string|object} pattern
     * @example
     * sntls.KeyValuePattern.create('|') // matches any key
     * sntls.KeyValuePattern.create(['foo', 'bar']) // matches keys 'foo' and 'bar'
     * sntls.KeyValuePattern.create('foo<bar^hello') // matches KV pairs 'foo'-'hello' & 'bar'-'hello'
     * @returns {sntls.KeyValuePattern}
     */

    /**
     * Matches a key-value pair. A series of key-value patterns make
     * up a query, which then can be used to traverse tree structures with.
     * @class sntls.KeyValuePattern
     * @extends troop.Base
     */
    sntls.KeyValuePattern = troop.Base.extend()
        .addConstants(/** @lends sntls.KeyValuePattern */{
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
             * Extracts markers and content from the string representation of a
             * key value pattern. There are two markers: the bracket and curly brace.
             * A marker is valid when and only when the first and last character is a
             * boundary character, and no boundary characters can be found inside the
             * KVP contents. Does not check for validity otherwise.
             * Markers have no meaning on their own. Their meaning is inferred by the
             * mechanism that uses them, eg. tree traversal.
             * @example
             * "{hello^world}"
             * "[|]"
             * @type {RegExp}
             */
            RE_MARKER_EXTRACTOR: /\[([^\[\]]*)\]|{([^{}]*)}|.*/
        })
        .addPrivateMethods(/** @lends sntls.KeyValuePattern */{
            /**
             * URI decodes all items of an array.
             * @param {string[]} strings Array of strings
             * @returns {string[]} Array w/ all strings within URI-encoded
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
             * @returns {string[]} Array w/ all strings URI-decoded
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
             */
            _parseString: function (pattern) {
                var markerDescriptor = pattern.match(this.RE_MARKER_EXTRACTOR),
                    content = markerDescriptor[2] || markerDescriptor[1] || markerDescriptor[0],
                    marker = markerDescriptor[2] || markerDescriptor[1] ?
                        // pattern is marked, taking first character as marker
                        pattern[0] :
                        // pattern is unmarked
                        undefined,
                    keyValue = content.split(this.KEY_VALUE_SEPARATOR),
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
                } else if (keyValue.length === 1 && !marker) {
                    // string literal key, no value
                    return decodeURI(key);
                } else {
                    // string literal key, has value or marker
                    result = {
                        key: decodeURI(key)
                    };
                }

                if (marker) {
                    // adding marker
                    result.marker = marker;
                }

                // processing value part of pattern
                if (keyValue.length > 1) {
                    // pattern has value bundled
                    result.value = decodeURI(keyValue[1]);
                }

                return result;
            }
        })
        .addMethods(/** @lends sntls.KeyValuePattern# */{
            /**
             * @param {string|object} pattern
             * @ignore
             */
            init: function (pattern) {
                /**
                 * Pattern descriptor
                 * @type {string|Object}
                 */
                this.descriptor = undefined;

                if (validators.isString(pattern)) {
                    this.descriptor = this._parseString(pattern);
                } else if (pattern instanceof Array) {
                    this.descriptor = {
                        options: pattern
                    };
                } else if (pattern instanceof Object) {
                    this.descriptor = pattern;
                } else {
                    dessert.assert(false, "Invalid pattern");
                }
            },

            /**
             * Sets value on query pattern. Pattern with a value will only
             * match nodes with the specified value.
             * @param {*} value
             * @returns {sntls.KeyValuePattern}
             */
            setValue: function (value) {
                var descriptor = this.descriptor;

                if (typeof descriptor === 'string') {
                    // descriptor is simple string
                    // transforming descriptor to object with key wrapped inside
                    descriptor = this.descriptor = {
                        key: descriptor
                    };
                }

                // adding value to descriptor
                descriptor.value = value;

                return this;
            },

            /**
             * Tells whether the current pattern is a skipper
             * @returns {boolean}
             */
            isSkipper: function () {
                return this.descriptor.symbol === this.SKIP_SYMBOL;
            },

            /**
             * Returns marker for key value pattern instance.
             * @returns {string}
             */
            getMarker: function () {
                return this.descriptor.marker;
            },

            /**
             * Determines whether pattern matches specified key
             * @param {string} key
             * @returns {boolean}
             */
            matchesKey: function (key) {
                var descriptor = this.descriptor;

                if (typeof descriptor === 'string') {
                    // descriptor is string, must match by value
                    return descriptor === key;
                } else if (descriptor instanceof Object) {
                    // descriptor is object, properties tell about match
                    if (hOP.call(descriptor, 'symbol')) {
                        // descriptor is wildcard object
                        return descriptor.symbol === this.WILDCARD_SYMBOL;
                    } else if (hOP.call(descriptor, 'options')) {
                        // descriptor is list of options
                        return descriptor.options.indexOf(key) > -1;
                    } else if (hOP.call(descriptor, 'key')) {
                        return descriptor.key === key;
                    }
                }

                return false;
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
                        result = this._encodeURI(descriptor.options)
                            .join(this.OPTION_SEPARATOR);
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

troop.postpone(sntls, 'KeyValuePatternCollection', function () {
    "use strict";

    /**
     * Instantiates class
     * @name sntls.KeyValuePatternCollection.create
     * @function
     * @returns {sntls.KeyValuePatternCollection}
     */

    /**
     * @name sntls.KeyValuePatternCollection#descriptor
     * @ignore
     */

    /**
     * @class sntls.KeyValuePatternCollection
     * @extends sntls.Collection
     * @extends sntls.KeyValuePattern
     */
    sntls.KeyValuePatternCollection = sntls.Collection.of(sntls.KeyValuePattern);
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isKeyValuePattern: function (expr) {
            return sntls.KeyValuePattern.isBaseOf(expr);
        },

        isKeyValuePatternOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.KeyValuePattern.isBaseOf(expr);
        }
    });

    troop.Properties.addProperties.call(
        String.prototype,
        /** @lends String# */{
            /**
             * Creates a new KeyValuePattern instance based on the current string.
             * @returns {sntls.KeyValuePattern}
             */
            toKeyValuePattern: function () {
                return /** @type {sntls.KeyValuePattern} */ sntls.KeyValuePattern.create(this);
            },

            /**
             * Shorthand to String.prototype.toKeyValuePattern().
             * Creates a new KeyValuePattern instance based on the current string.
             * @returns {sntls.KeyValuePattern}
             */
            toKVP: function () {
                return /** @type {sntls.KeyValuePattern} */ sntls.KeyValuePattern.create(this);
            }
        },
        false, false, false
    );

    troop.Properties.addProperties.call(
        Array.prototype,
        /** @lends Array# */{
            /**
             * Creates a new KeyValuePattern instance based on the current array.
             * @returns {sntls.KeyValuePattern}
             */
            toKeyValuePattern: function () {
                return /** @type {sntls.KeyValuePattern} */ sntls.KeyValuePattern.create(this);
            },

            /**
             * Shorthand to Array.prototype.toKeyValuePattern().
             * Creates a new KeyValuePattern instance based on the current array.
             * @returns {sntls.KeyValuePattern}
             */
            toKVP: function () {
                return /** @type {sntls.KeyValuePattern} */ sntls.KeyValuePattern.create(this);
            }
        },
        false, false, false
    );
}());
