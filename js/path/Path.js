/**
 * General Path
 *
 * Represents a composite linear key, essentially
 * an array, or a '>'-delimited string.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Path', function () {
    "use strict";

    /**
     * @class sntls.Path
     * @extends troop.Base
     */
    sntls.Path = troop.Base.extend()
        .addConstant(/** @lends sntls.Path */{
            RE_PATH_SEPARATOR: />/
        })
        .addPrivateMethod(/** @lends sntls.Path */{
            /**
             * URI encodes all items of an array.
             * @param {string[]} asArray Array of plain strings
             * @return {string[]} Array of URI-encoded strings
             * @private
             */
            _encodeURI: function (asArray) {
                var result = [],
                    i;
                for (i = 0; i < asArray.length; i++) {
                    result.push(encodeURI(asArray[i]));
                }
                return result;
            },

            /**
             * URI decodes all items of an array.
             * @param {string[]} asArray Array of URI-encoded strings
             * @return {string[]} Array of plain strings
             * @private
             */
            _decodeURI: function (asArray) {
                var result = [],
                    i;
                for (i = 0; i < asArray.length; i++) {
                    result.push(decodeURI(asArray[i]));
                }
                return result;
            }
        })
        .addMethod(/** @lends sntls.Path */{
            /**
             * @name sntls.Path.create
             * @return {sntls.Path}
             */

            /**
             * @path {string|string[]} Path in string or array representation
             */
            init: function (path) {
                var asArray;

                // array representation is expected to be used more often
                if (path instanceof Array) {
                    asArray = path;
                } else if (dessert.validators.isString(path)) {
                    asArray = this._decodeURI(path.split(this.RE_PATH_SEPARATOR));
                } else {
                    dessert.assert(false, "Invalid path");
                }

                /**
                 * Array buffer. Public because grants fast access.
                 * Should not be changed from the outside.
                 * @type {Array}
                 */
                this.asArray = asArray;
            },

            /**
             * Clones path
             * @return {sntls.Path}
             */
            clone: function () {
                return /** @type sntls.Path */ this.getBase().create(this.asArray.concat());
            },

            /**
             * Trims trailing end of path. (Removes last key)
             * @return {sntls.Path}
             */
            trim: function () {
                return /** @type sntls.Path */ this.getBase().create(this.asArray.slice(0, -1));
            },

            /**
             * Prepends path with other path.
             * @param {sntls.Path} path
             * @return {sntls.Path}
             */
            prepend: function (path) {
                return /** @type sntls.Path */ this.getBase().create(path.asArray.concat(this.asArray));
            },

            /**
             * Resolves a path relative to the supplied context.
             * @param {object} context
             * @return {object}
             */
            resolve: function (context) {
                dessert.isObject(context, "Invalid path context");

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
                dessert.isObject(context, "Invalid path context");

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
             * @param {sntls.Path} remotePath Remote path
             * @return {boolean}
             */
            equals: function (remotePath) {
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
             * Tells whether the current path is relative to the
             * the root path, ie. it matches the beginning of
             * the current path entirely.
             * @param {sntls.Path} rootPath
             * @return {boolean}
             */
            isRelativeTo: function (rootPath) {
                dessert.isPath(rootPath, "Invalid path");

                var currentArray = this.asArray,
                    rootArray = rootPath.asArray,
                    i;

                if (rootArray.length > currentArray.length) {
                    return false;
                }

                for (i = 0; i < rootArray.length; i++) {
                    if (currentArray[i] !== rootArray[i]) {
                        return false;
                    }
                }

                return true;
            },

            /**
             * String representation
             * @return {string}
             */
            toString: function () {
                return this._encodeURI(this.asArray).join('>');
            }
        });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isPath: function (expr) {
            return sntls.Path.isBaseOf(expr);
        },

        isPathOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Path.isBaseOf(expr);
        }
    });

    troop.Properties.addProperties.call(
        String.prototype,
        /** @lends String.prototype */{
            /**
             * @return {sntls.Path}
             */
            toPath: function () {
                return sntls.Path.create(this);
            }
        },
        false, false, false
    );

    troop.Properties.addProperties.call(
        Array.prototype,
        /** @lends Array.prototype */{
            /**
             * @return {sntls.Path}
             */
            toPath: function () {
                return sntls.Path.create(this);
            }
        },
        false, false, false
    );
}());
