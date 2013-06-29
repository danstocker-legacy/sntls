/*global dessert, troop, sntls */
troop.postpone(sntls, 'Path', function () {
    "use strict";

    var validators = dessert.validators,
        base = troop.Base,
        self = base.extend();

    /**
     * Instantiates class.
     * Initializes Path with a string or array. Keys are assumed to be URI-encoded.
     * @name sntls.Path.create
     * @function
     * @param {string|string[]} path Path in string or array representation
     * @returns {sntls.Path}
     */

    /**
     * Represents a composite linear key, essentially
     * an array, or a '>'-delimited string.
     * @class sntls.Path
     * @extends troop.Base
     */
    sntls.Path = self
        .addConstants(/** @lends sntls.Path */{
            PATH_SEPARATOR: '>'
        })
        .addPrivateMethods(/** @lends sntls.Path */{
            /**
             * URI encodes all items of an array.
             * @param {string[]} asArray Array of plain strings
             * @returns {string[]} Array of URI-encoded strings
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
             * @returns {string[]} Array of plain strings
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
        .addMethods(/** @lends sntls.Path# */{
            /**
             * @param {string|string[]} path Path in string or array representation
             * @ignore
             */
            init: function (path) {
                var asArray;

                // array representation is expected to be used more often
                if (path instanceof Array) {
                    asArray = path;
                } else if (validators.isString(path)) {
                    asArray = this._decodeURI(path.split(this.PATH_SEPARATOR));
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
             * @returns {sntls.Path}
             */
            clone: function () {
                return /** @type sntls.Path */ this.getBase().create(this.asArray.concat());
            },

            /**
             * Trims trailing end of path.
             * Changes path buffer!
             * @returns {sntls.Path}
             */
            trim: function () {
                this.asArray.pop();
                return this;
            },

            /**
             * Appends path with specified path.
             * Changes path buffer!
             * @param {sntls.Path} path
             * @returns {sntls.Path}
             */
            append: function (path) {
                this.asArray = this.asArray.concat(path.asArray);
                return this;
            },

            /**
             * Prepends path with specified path.
             * Changes path buffer!
             * @param {sntls.Path} path
             * @returns {sntls.Path}
             */
            prepend: function (path) {
                this.asArray = path.asArray.concat(this.asArray);
                return this;
            },

            /**
             * Matches remote path to current path.
             * @param {sntls.Path} remotePath Remote path
             * @returns {boolean}
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
             * @returns {boolean}
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
             * @returns {string}
             */
            toString: function () {
                return this._encodeURI(this.asArray).join(this.PATH_SEPARATOR);
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
             * @returns {sntls.Path}
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
             * @returns {sntls.Path}
             */
            toPath: function () {
                return sntls.Path.create(this);
            }
        },
        false, false, false
    );
}());
