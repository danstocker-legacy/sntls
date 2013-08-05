/*global dessert, troop, sntls */
troop.postpone(sntls, 'Hash', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        slice = Array.prototype.slice;

    /**
     * Instantiates class.
     * @name sntls.Hash.create
     * @function
     * @param {object|Array} items Container for hash items.
     * @returns {sntls.Hash}
     */

    /**
     * General wrapper around objects to treat them as hash.
     * Calling `Object.prototype` methods on hash objects is not viable as they may be
     * shadowed by user data, and such cases certainly lead the application to break.
     * Other `Hash`-based classes may delegate conversion methods to this class.
     * @class sntls.Hash
     * @extends troop.Base
     */
    sntls.Hash = troop.Base.extend()
        .addMethods(/** @lends sntls.Hash# */{
            /**
             * @param {object|Array} items Container for hash items.
             * @ignore
             */
            init: function (items) {
                dessert.isObjectOptional(items, "Invalid items");

                /**
                 * Object buffer that stores items. Technically writable and public for performance
                 * and transparency reasons, but should not be changed externally as may lead to inconsistent state
                 * especially in `Hash`-based subclasses.
                 * @type {Object|Array}
                 */
                this.items = items || {};

                /**
                 * Tracks number of distinct keys in the hash. Uninitialized until first queried.
                 * (by either `.getKeys()` or `.getKeyCount()`), therefore it is safer to use its getter
                 * method. Should not be modified externally.
                 * @type {number}
                 */
                this.keyCount = items ? undefined : 0;
            },

            /**
             * Retrieves the first available key it can find. If hash has more than one items,
             * any of the hash's keys may be returned. Result does not necessarily match up with the return value
             * of `.getFirstValue()`.
             * @returns {string}
             * @see sntls.Hash#getFirstValue
             */
            getFirstKey: function () {
                var items = this.items,
                    key;
                for (key in items) {
                    if (hOP.call(items, key)) {
                        return key;
                    }
                }
                return undefined;
            },

            /**
             * Retrieves item keys as an array. The order in which keys appear in the resulting array
             * is not deterministic.
             * @returns {string[]}
             */
            getKeys: function () {
                var result = Object.keys(this.items);
                if (typeof this.keyCount !== 'number') {
                    this.keyCount = result.length;
                }
                return result;
            },

            /**
             * Retrieves item keys wrapped in a hash.
             * @returns {sntls.Hash}
             * @see sntls.Hash#getKeys
             */
            getKeysAsHash: function () {
                return sntls.Hash.create(this.getKeys());
            },

            /**
             * Retrieves the number of keys in hash.
             * @example
             * var c = sntls.Hash.create({foo: 1, bar: 2});
             * c.getKeyCount() // 2
             * @returns {number}
             */
            getKeyCount: function () {
                if (typeof this.keyCount !== 'number') {
                    this.keyCount = Object.keys(this.items).length;
                }
                return this.keyCount;
            },

            /**
             * Retrieves the first available value it can find. If hash has more than one items,
             * any value from the hash may be returned. Result does not necessarily match up with the return value
             * of `.getFirstKey()`.
             * @returns {*}
             * @see sntls.Hash#getFirstKey
             */
            getFirstValue: function () {
                var items = this.items,
                    key;
                for (key in items) {
                    if (hOP.call(items, key)) {
                        return items[key];
                    }
                }
                return undefined;
            },

            /**
             * Retrieves collection items in an array, without key information. The order in which keys appear
             * in the resulting array is not deterministic.
             * @returns {Array}
             */
            getValues: function () {
                var items = this.items,
                    keys = Object.keys(items),
                    result = [],
                    i;

                for (i = 0; i < keys.length; i++) {
                    result.push(items[keys[i]]);
                }

                return result;
            },

            /**
             * Retrieves item values wrapped in a hash.
             * @returns {sntls.Hash}
             * @see sntls.Hash#getValues
             */
            getValuesAsHash: function () {
                return sntls.Hash.create(this.getValues());
            },

            /**
             * Changes buffer type from Object to Array or vice versa.
             * Changes the current hash instance!
             * @param {function} bufferType=Object `Array` or `Object`, specifying new buffer type.
             * @example
             * sntls.Hash.create({0: 'foo', 1: 'bar'}).changeBufferTypeTo(Array).items // ['foo', 'bar']
             * @returns {sntls.Hash}
             */
            changeBufferTypeTo: function (bufferType) {
                if (!this.items instanceof bufferType) {
                    return this;
                }

                var items = this.items,
                    buffer = bufferType === Array ? [] : {},
                    keys = Object.keys(items),
                    i, key;

                // adding items to new buffer
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    buffer[key] = items[key];
                }

                // setting new buffer and resetting key count
                this.items = buffer;
                this.keyCount = undefined;

                return this;
            },

            /**
             * Clears hash by replacing items buffer with an empty one.
             * Observes current buffer type, ie. if hash was array based, the new buffer will be also array.
             * @returns {sntls.Hash}
             */
            clear: function () {
                this.items = this.items instanceof Array ? [] : {};
                return this;
            },

            /**
             * Passes the items buffer to the specified function.
             * @param {function} handler External handler accepting the buffer.
             * @param {*} [context] Context in which to call the handler. If handler is a method, the context
             * should be the owner (instance or class) of the method.
             * @param {number} [argIndex=0] Argument index taken by buffer when calling the function.
             * @returns {*} Whatever is returned by the handler.
             */
            passItemsTo: function (handler, context, argIndex) {
                argIndex = argIndex || 0;
                var args = slice.call(arguments, 3);
                dessert.assert(args.length >= argIndex, "Invalid argument index", argIndex);
                args.splice(argIndex, 0, this.items);
                return handler.apply(context || this, args);
            },

            /**
             * Passes itself to the specified function.
             * @param {function} handler External handler accepting the hash.
             * @param {*} [context] Context in which to call the handler. If handler is a method, the context
             * should be the owner (instance or class) of the method.
             * @param {number} [argIndex=0] Argument index taken by buffer when calling the function.
             * @returns {*} Whatever is returned by the handler.
             */
            passSelfTo: function (handler, context, argIndex) {
                argIndex = argIndex || 0;
                var args = slice.call(arguments, 3);
                dessert.assert(args.length >= argIndex, "Invalid argument index", argIndex);
                args.splice(argIndex, 0, this);
                return handler.apply(context || this, args);
            }
        });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isHash: function (expr) {
            return sntls.Hash.isBaseOf(expr);
        },

        isHashOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Hash.isBaseOf(expr);
        }
    });
}());
