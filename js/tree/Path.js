/*global dessert, troop, sntls */
troop.postpone(sntls, 'Path', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * Instantiates class.
     * Constructs path instance and populates it with path information. Keys are assumed to be URI-encoded.
     * @name sntls.Path.create
     * @function
     * @param {string[]} path Path in array representation (eg. ['this', 'is', 'a', 'path']).
     * @returns {sntls.Path}
     */

    /**
     * Unambiguously identifies a node in a tree-like structure. Paths break down to a series of keys, each
     * subsequent key corresponding to a property in the next child node.
     * @class sntls.Path
     * @extends troop.Base
     */
    sntls.Path = self
        .addConstants(/** @lends sntls.Path */{
            PATH_SEPARATOR: '>'
        })
        .addMethods(/** @lends sntls.Path# */{
            /**
             * @param {string[]} asArray Path in string or array representation
             * @ignore
             */
            init: function (asArray) {
                dessert.isArray(asArray, "Invalid path array");

                /**
                 * Path in array representation. Keys are unencoded. Not to be modified externally.
                 * @type {Array}
                 */
                this.asArray = asArray;
            },

            /**
             * Fetches the last key from the path.
             * @returns {*}
             */
            getLastKey: function () {
                var asArray = this.asArray;
                return asArray[asArray.length - 1];
            },

            /**
             * Creates a new instance of the same path subclass, initialized with identical path information.
             * @returns {sntls.Path}
             */
            clone: function () {
                return /** @type sntls.Path */ this.getBase().create(this.asArray.concat());
            },

            /**
             * Trims leading end of path. Alters path buffer!
             * @example
             * var p = 'test>path>it>is'.toPath();
             * p.trimLeft().asArray // ['path', 'it', 'is']
             * @param {number} [count=1] Number of keys to remove from path.
             * @returns {sntls.Path}
             */
            trimLeft: function (count) {
                if (typeof count === 'undefined' || count === 1) {
                    this.asArray.shift();
                } else {
                    this.asArray = this.asArray.slice(count);
                }
                return this;
            },

            /**
             * Trims trailing end of path. Alters path buffer!
             * @example
             * var p = 'test>path>it>is'.toPath();
             * p.trimRight().asArray // ['test', 'path', 'it']
             * @param {number} [count=1] Number of keys to remove from path.
             * @returns {sntls.Path}
             */
            trimRight: function (count) {
                if (typeof count === 'undefined' || count === 1) {
                    this.asArray.pop();
                } else {
                    this.asArray = this.asArray.slice(0, 0 - count);
                }
                return this;
            },

            /**
             * Appends the specified path to the current path. Alters path buffer!
             * @param {sntls.Path} path Path to be appended to the current path.
             * @returns {sntls.Path}
             */
            append: function (path) {
                this.asArray = this.asArray.concat(path.asArray);
                return this;
            },

            /**
             * Appends a single key to the current path. Alters path buffer!
             * @param {string} key Key to be appended to the current path.
             * @returns {sntls.Path}
             */
            appendKey: function (key) {
                this.asArray.push(key);
                return this;
            },

            /**
             * Prepends the current path with the specified path. Alters path buffer!
             * @example
             * var p = 'test>path'.toPath();
             * p.prepend('foo.bar').asArray // ['foo', 'bar', 'test', 'path']
             * @param {sntls.Path} path Path to be prepended to the current path.
             * @returns {sntls.Path}
             */
            prepend: function (path) {
                this.asArray = path.asArray.concat(this.asArray);
                return this;
            },

            /**
             * Prepends a single key to the current path. Alters path buffer!
             * @param {string} key Key to be prepended to the current path.
             * @returns {sntls.Path}
             */
            prependKey: function (key) {
                this.asArray.unshift(key);
                return this;
            },

            /**
             * Checks whether current path and specified path are identical by value.
             * @example
             * var p = 'foo>bar'.toPath();
             * p.equal('foo.bar') // true
             * p.equal('hello.world') // false
             * @param {sntls.Path} remotePath Remote path
             * @returns {boolean}
             */
            equals: function (remotePath) {
                if (!self.isBaseOf(remotePath)) {
                    return false;
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
             * Checks whether current path is relative to the specified root path. Path A is relative to B
             * when A and B have a common base path and that base path is B.
             * @example
             * var p = 'foo>bar'.toPath();
             * p.isRelativeTo('foo') // true
             * p.isRelativeTo('foo.bar.hello') // false
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
             * Determines whether current path is root of specified path.
             * @param {sntls.Path} relativePath
             * @returns {boolean}
             */
            isRootOf: function (relativePath) {
                dessert.isPath(relativePath, "Invalid path");
                return relativePath.isRelativeTo(this);
            },

            /**
             * Returns the string representation for the path, keys URI encoded and separated by '>'.
             * @example
             * ['test^', 'path'].toPath().toString() // "test%5E>path"
             * @returns {string}
             */
            toString: function () {
                return this.asArray.toUriEncoded().join(this.PATH_SEPARATOR);
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
        /** @lends String# */{
            /**
             * Creates a new Path instance based on the current string.
             * Individual keys will be URI decoded.
             * @returns {sntls.Path}
             */
            toPath: function () {
                var Path = sntls.Path;
                return Path.create(this.split(Path.PATH_SEPARATOR).toUriDecoded());
            }
        },
        false, false, false
    );

    troop.Properties.addProperties.call(
        Array.prototype,
        /** @lends Array# */{
            /**
             * Creates a new Path instance based on the current array.
             * @returns {sntls.Path}
             */
            toPath: function () {
                return sntls.Path.create(this);
            }
        },
        false, false, false
    );
}());
