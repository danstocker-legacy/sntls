/**
 * Tree
 *
 * Manages tree data structure
 */
/*global dessert, troop, sntls */
troop.postpone(sntls, 'Tree', function () {
    "use strict";

    /**
     * @class sntls.Tree
     * @extends sntls.Hash
     */
    sntls.Tree = sntls.Hash.extend()
        .addMethods(/** @lends sntls.Tree */{
            /**
             * @name sntls.Tree.create
             * @return {sntls.Tree}
             */

            /**
             * Retrieves the value at the specified path.
             * @param {sntls.Path} path Path to node
             * @return {*} Whatever value is found at path
             */
            getNode: function (path) {
                var asArray = path.asArray,
                    result = this.items,
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
             * Retrieves object at the specified path wrapped in a Hash object.
             * @param {sntls.Path} path Path to node
             * @return {sntls.Hash}
             */
            getNodeAsHash: function (path) {
                return sntls.Hash.create(this.getNode(path));
            },

            /**
             * Retrieves the value at the specified path, or
             * when the path does not exist, creates path and
             * assigns an empty object.
             * @param {sntls.Path} path
             * @returns {object}
             */
            getSafeNode: function (path) {
                var asArray = path.asArray,
                    result = this.items,
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
             * Retrieves safe value at path, wrapped in a hash.
             * @param {sntls.Path} path
             * @returns {sntls.Hash}
             */
            getSafeNodeAsHash: function (path) {
                return sntls.Hash.create(this.getSafeNode(path));
            },

            /**
             * Sets the node at the specified path to the given value.
             * @param {sntls.Path} path Path to node
             * @param {*} value Node value to set
             * @return {sntls.Tree}
             */
            setNode: function (path, value) {
                var node = this.getSafeNode(path.clone().trim()),
                    asArray = path.asArray,
                    lastKey = asArray[asArray.length - 1];

                node[lastKey] = value;

                return this;
            },

            /**
             * Retrieves the value at the specified path, or
             * when the path does not exist, creates path and
             * assigns the return value of the generator.
             * @param {sntls.Path} path Path to node
             * @param {function} generator Generator function returning value
             * @return {*}
             */
            getOrSetNode: function (path, generator) {
                var node = this.getSafeNode(path.clone().trim()),
                    asArray = path.asArray,
                    lastKey = asArray[asArray.length - 1];

                if (!node.hasOwnProperty(lastKey)) {
                    node[lastKey] = generator();
                }

                return node[lastKey];
            },

            /**
             * Removes node at the specified path.
             * @param {sntls.Path} path Path to node
             * @return {sntls.Tree}
             */
            unsetNode: function (path) {
                var node = this.getSafeNode(path.clone().trim()),
                    asArray = path.asArray,
                    lastKey = asArray[asArray.length - 1];

                delete node[lastKey];

                return this;
            },

            /**
             * Traverses tree recursively, guided by the specified query array
             * @param {sntls.Query} query
             * @param {function} handler
             */
            traverseByQuery: function (query, handler) {
                // creating tree walker and walking tree buffer
                sntls.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return this;
            },

            /**
             * Queries node values from tree
             * @param {sntls.Query} query
             * @returns {Array}
             */
            queryValues: function (query) {
                var result = [];

                function handler(node) {
                    result.push(node);
                }

                // creating tree walker and walking tree buffer
                sntls.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return result;
            },

            /**
             * Queries node values from tree wrapped in a hash
             * @param {sntls.Query} query
             * @returns {sntls.Hash}
             */
            queryValuesAsHash: function (query) {
                return sntls.Hash.create(this.queryValues(query));
            },

            /**
             * Queries node keys from tree
             * @param {sntls.Query} query
             * @returns {Array}
             */
            queryKeys: function (query) {
                /*jshint validthis:true */
                var result = [];

                function handler() {
                    result.push(this.currentKey);
                }

                // creating tree walker and walking tree buffer
                sntls.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return result;
            },

            /**
             * Queries node keys from tree wrapped in a hash
             * @param {sntls.Query} query
             * @returns {sntls.Hash}
             */
            queryKeysAsHash: function (query) {
                return sntls.Hash.create(this.queryKeys(query));
            },

            /**
             * Queries paths from tree
             * @param {sntls.Query} query
             * @returns {Array}
             */
            queryPaths: function (query) {
                /*jshint validthis:true */
                var result = [];

                function handler() {
                    result.push(this.currentPath.clone());
                }

                // creating tree walker and walking tree buffer
                sntls.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return result;
            },

            /**
             * Queries paths from tree wrapped in a hash
             * @param {sntls.Query} query
             * @returns {sntls.Hash}
             */
            queryPathsAsHash: function (query) {
                return sntls.Hash.create(this.queryPaths(query));
            }
        });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isTree: function (expr) {
            return sntls.Tree.isBaseOf(expr);
        },

        isTreeOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Tree.isBaseOf(expr);
        }
    });

    sntls.Hash.addMethods(/** @lends sntls.Hash */{
        /**
         * @return {sntls.Tree}
         */
        toTree: function () {
            return sntls.Tree.create(this.items);
        }
    });
}());
