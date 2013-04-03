/**
 * General Path
 *
 * Represents a composite linear key, essentially
 * an array, or a dot-separated string.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Path', function () {
    var self;

    /**
     * @class sntls.Path
     * @extends troop.Base
     */
    sntls.Path = self = troop.Base.extend()
        .addConstant(/** @lends sntls.Path */{
            RE_PATH_SEPARATOR: /\./
        })
        .addMethod(/** @lends sntls.Path */{
            /**
             * @path {string|string[]}
             */
            init: function (path) {
                var asArray;

                // array representation is expected to be used more often
                if (path instanceof Array) {
                    asArray = path;
                } else if (typeof path === 'string') {
                    asArray = path.split(this.RE_PATH_SEPARATOR);
                } else {
                    dessert.assert(false, "Invalid path");
                }

                this.addPublic(/** @lends sntls.Path */{
                    /**
                     * Array buffer. Public because grants fast access.
                     * Should not be changed from the outside.
                     * @type {Array}
                     */
                    asArray: asArray
                });
            },

            /**
             * Resolves a path relative to the supplied context.
             * @param {object} context
             * @return {object}
             */
            resolve: function (context) {
                dessert.isObject(context);

                var asArray = this.asArray,
                    result = context,
                    i;

                for (i = 0; i < asArray.length; i++) {
                    result = result[asArray[i]];
                    if (typeof result === 'undefined') {
                        break;
                    }
                }

                return result;
            },

            /**
             * Same as .resolve(), but builds the path if it does not exist
             * and returns the object found at the end.
             * @see {sntls.Path.resolve}
             * @param {object} context Object on which the path is resolved
             * @return {object}
             */
            resolveOrBuild: function (context) {
                dessert.isObject(context);

                var asArray = this.asArray,
                    result = context,
                    i, key;

                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (typeof result[key] !== 'object') {
                        result[key] = {};
                    }
                    result = result[key];
                }

                return result;
            },

            /**
             * Matches remote path to current path.
             * @param {sntls.Path|string|string[]} remotePath Remote path
             * @return {boolean}
             */
            equal: function (remotePath) {
                if (!self.isBaseOf(remotePath)) {
                    remotePath = self.create(remotePath);
                }

                var currentArray = this.asArray,
                    remoteArray = remotePath.asArray,
                    i;

                if (currentArray.length !== remoteArray.length) {
                    return false;
                } else {
                    for (i = 0; i < remoteArray.length; i++) {
                        if (currentArray[i] !== remoteArray[i]) {
                            return false;
                        }
                    }
                }

                return true;
            },

            /**
             * String representation
             * @return {string}
             */
            toString: function () {
                return this.asArray.join('.');
            }
        });
});

dessert.addTypes(/** @lends dessert */{
    isPath: function (expr) {
        return sntls.Path.isBaseOf(expr);
    },

    isPathOptional: function (expr) {
        return typeof expr === 'undefined' ||
               sntls.Path.isBaseOf(expr);
    }
});
