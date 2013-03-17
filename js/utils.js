/**
 * General Utilities
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'utils', function () {
    /**
     * @class sntls.utils
     * @extends troop.Base
     */
    sntls.utils = troop.Base.extend()
        .addMethod(/** @lends sntls.utils */{
            /**
             * Creates a shallow copy of an object.
             * Property names will be copied, but property values
             * will point to the original references.
             * @param {object} original
             * @return {object} shallow copy of original
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
            },

            /**
             * Resolves a path relative to a host object.
             * @param {object} host
             * @param {string[]} path
             * @return {*} Whatever is found at the end of the path.
             * @link http://jsperf.com/path-resolution
             */
            resolve: function (host, path) {
                dessert
                    .isObject(host, "Invalid host for path resolution")
                    .isArray(path, "Invalid path");

                path = path.concat([]);

                var result = host;

                while (path.length) {
                    result = result[path.shift()];
                    if (typeof result !== 'object') {
                        break;
                    }
                }

                return result;
            }
        });
});
