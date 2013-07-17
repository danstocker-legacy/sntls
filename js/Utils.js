/**
 * General Utilities
 */
/*global dessert, troop, sntls */
troop.postpone(sntls, 'Utils', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class sntls.Utils
     * @extends troop.Base
     */
    sntls.Utils = troop.Base.extend()
        .addMethods(/** @lends sntls.Utils */{
            /**
             * Determines whether an object has any enumerable
             * properties.
             * @param {object} obj
             * @returns {boolean}
             */
            isEmptyObject: function (obj) {
                var key;
                for (key in obj) {
                    if (hOP.call(obj, key)) {
                        return false;
                    }
                }
                return true;
            },

            /**
             * Determines whether an object has exactly one
             * enumerable property.
             * @param {object} obj
             * @returns {boolean}
             */
            isSingularObject: function (obj) {
                var count = 0,
                    key;
                for (key in obj) {
                    if (hOP.call(obj, key) && ++count > 1) {
                        return false;
                    }
                }
                return count === 1;
            },

            /**
             * Creates a shallow copy of an object.
             * Property names will be copied, but property values
             * will point to the original references.
             * @param {object|Array} original
             * @returns {object|Array} shallow copy of original
             */
            shallowCopy: function (original) {
                if (dessert.validators.isArray(original)) {
                    // shorthand for arrays
                    return original.concat([]);
                }

                dessert.isObject(original, "Invalid copy source object");

                var propertyNames = Object.getOwnPropertyNames(original),
                    i, propertyName,
                    result = {};

                for (i = 0; i < propertyNames.length; i++) {
                    propertyName = propertyNames[i];
                    result[propertyName] = original[propertyName];
                }

                return result;
            }
        });
});
