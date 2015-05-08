/*global troop */
(function () {
    "use strict";

    troop.Properties.addProperties.call(
        Array.prototype,
        /** @lends Array# */{
            /**
             * Creates a new array based on the contents of the current array, so that the new array
             * will stringify everything that is not: undefined, string, or object.
             * @returns {Array}
             */
            toPathArray: function () {
                var result = [],
                    i, item;
                for (i = 0; i < this.length; i++) {
                    item = this[i];
                    switch (typeof item) {
                    case 'undefined':
                    case 'string':
                    case 'object':
                        result.push(item);
                        break;
                    default:
                        result.push(String(item));
                        break;
                    }
                }
                return result;
            },

            /**
             * URI encodes all items of an array.
             * @returns {string[]} Array of URI-encoded strings
             */
            toUriEncoded: function () {
                var result = [],
                    i;
                for (i = 0; i < this.length; i++) {
                    result.push(encodeURI(this[i]));
                }
                return result;
            },

            /**
             * URI decodes all items of an array.
             * @returns {string[]} Array of plain strings
             */
            toUriDecoded: function () {
                var result = [],
                    i;
                for (i = 0; i < this.length; i++) {
                    result.push(decodeURI(this[i]));
                }
                return result;
            }
        },
        false, false, false
    );
}());
