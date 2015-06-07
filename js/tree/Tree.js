/*global dessert, troop, sntls */
troop.postpone(sntls, 'Tree', function () {
    "use strict";

    var Hash = sntls.Hash;

    /**
     * Instantiates class
     * @name sntls.Tree.create
     * @function
     * @param {object} [items]
     * @returns {sntls.Tree}
     */

    /**
     * Accesses, traverses, and modifies tree-like object structures.
     * @class sntls.Tree
     * @extends sntls.Hash
     */
    sntls.Tree = Hash.extend()
        .addMethods(/** @lends sntls.Tree# */{
            /**
             * Retrieves the value at the specified path.
             * @param {sntls.Path} path Path to node
             * @returns {*} Whatever value is found at path
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
             * @returns {sntls.Hash}
             */
            getNodeAsHash: function (path) {
                return Hash.create(this.getNode(path));
            },

            /**
             * Retrieves the value at the specified path, or
             * when the path does not exist, creates path and
             * assigns an empty object.
             * @param {sntls.Path} path
             * @param {function} [handler] Callback receiving the path and value affected by change.
             * @returns {object}
             */
            getSafeNode: function (path, handler) {
                var asArray = path.asArray,
                    hasChanged = false,
                    result = this.items,
                    i, key;

                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (typeof result[key] !== 'object') {
                        hasChanged = true;
                        result[key] = {};
                    }
                    result = result[key];
                }

                if (hasChanged && handler) {
                    handler(path, result);
                }

                return result;
            },

            /**
             * Retrieves safe value at path, wrapped in a hash.
             * @param {sntls.Path} path
             * @param {function} [handler] Callback receiving the path affected by change.
             * @returns {sntls.Hash}
             */
            getSafeNodeAsHash: function (path, handler) {
                return Hash.create(this.getSafeNode(path, handler));
            },

            /**
             * Sets the node at the specified path to the given value.
             * @param {sntls.Path} path Path to node
             * @param {*} value Node value to set
             * @returns {sntls.Tree}
             */
            setNode: function (path, value) {
                var node = this.getSafeNode(path.clone().trimRight());
                node[path.getLastKey()] = value;
                return this;
            },

            /**
             * Retrieves the value at the specified path, or
             * when the path does not exist, creates path and
             * assigns the return value of the generator.
             * @param {sntls.Path} path Path to node
             * @param {function} generator Generator function returning value
             * @param {function} [handler] Callback receiving the path and value affected by change.
             * @returns {*}
             */
            getOrSetNode: function (path, generator, handler) {
                var parentPath = path.clone().trimRight(),
                    targetParent = this.getSafeNode(parentPath),
                    targetKey = path.getLastKey(),
                    result;

                if (targetParent.hasOwnProperty(targetKey)) {
                    result = targetParent[targetKey];
                } else {
                    result = targetParent[targetKey] = generator();
                    if (handler) {
                        handler(path, result);
                    }
                }

                return result;
            },

            /**
             * Removes node from the specified path, ie.
             * the node will be overwritten with an undefined value.
             * @param {sntls.Path} path
             * @returns {sntls.Tree}
             */
            unsetNode: function (path) {
                if (!path.asArray.length) {
                    // empty path equivalent to clear
                    this.clear();
                    return this;
                }

                var targetParent = this.getNode(path.clone().trimRight());

                if (targetParent instanceof Object) {
                    // concerns existing parent nodes only
                    targetParent[path.getLastKey()] = undefined;
                }

                return this;
            },

            /**
             * Removes key from the specified path.
             * @param {sntls.Path} path Path to node
             * @param {boolean} [splice=false] Whether to use splice when removing key from array.
             * @param {function} [handler] Callback receiving the path affected by change.
             * @returns {sntls.Tree}
             */
            unsetKey: function (path, splice, handler) {
                if (!path.asArray.length) {
                    // empty path equivalent to clear
                    this.clear();

                    if (handler) {
                        handler(path, this.items);
                    }

                    return this;
                }

                var parentPath = path.clone().trimRight(),
                    targetParent = this.getNode(parentPath);

                if (targetParent instanceof Object) {
                    // concerns existing parent nodes only
                    if (splice && targetParent instanceof Array) {
                        // removing marked node by splicing it out of array
                        targetParent.splice(path.getLastKey(), 1);
                    } else {
                        // deleting marked node
                        delete targetParent[path.getLastKey()];
                    }

                    if (handler) {
                        handler(parentPath, targetParent);
                    }
                }

                return this;
            },

            /**
             * Removes nodes from tree that have no children
             * other than the one specified by the path.
             * @param {sntls.Path} path Datastore path
             * @param {boolean} [splice=false] Whether to use splice when removing key from array.
             * @param {function} [handler] Callback receiving the path affected by change.
             * @returns {sntls.Tree}
             */
            unsetPath: function (path, splice, handler) {
                if (!path.asArray.length) {
                    // empty path equivalent to clear
                    this.clear();

                    if (handler) {
                        // root node changed, calling handler
                        handler(path);
                    }

                    return this;
                }

                var asArray = path.asArray,
                    parentNode = null, // parent node of current node
                    parentNodeSingle, // whether parent node has one child
                    currentKey = null, // key associated with current node in parent node
                    currentNode = this.items, // node currently processed
                    currentNodeSingle, // whether current node has one child
                    i, nextKey, // next key to be processed within current node

                    targetLevel, // position of target key in path
                    targetParent, // parent node in which to delete
                    targetKey; // key in parent node to be deleted

                // determining deletion target
                for (i = 0; i < asArray.length; i++) {
                    nextKey = asArray[i];

                    if (typeof currentNode === 'undefined') {
                        // current node is undefined
                        // breaking target search
                        break;
                    }

                    currentNodeSingle = sntls.Utils.isSingularObject(currentNode);
                    if (currentNodeSingle && parentNode !== null) {
                        // current node has exactly one child
                        // and is not root node
                        if (!parentNodeSingle) {
                            // ...but parent had more
                            // marking current node for deletion
                            targetLevel = i;
                            targetKey = currentKey;
                            targetParent = parentNode;
                        }
                    } else {
                        // current node has more than one child
                        // marking next node for deletion
                        targetLevel = i + 1;
                        targetKey = nextKey;
                        targetParent = currentNode;
                    }

                    // changing state for next iteration
                    currentKey = nextKey;
                    parentNode = currentNode;
                    currentNode = parentNode[nextKey];
                    parentNodeSingle = currentNodeSingle;
                }

                if (splice && targetParent instanceof Array) {
                    // removing marked node by splicing it out of array
                    // and setting target to parent (indicates update un that level)
                    targetParent.splice(targetKey, 1);
                    targetLevel--;
                    currentNode = targetParent;
                } else {
                    // deleting marked node and setting target to undefined (indicates removal)
                    delete targetParent[targetKey];
                    currentNode = undefined;
                }

                if (handler) {
                    // calling handler with affected path
                    handler(asArray.slice(0, targetLevel).toPath(), currentNode);
                }

                return this;
            },

            /**
             * Moves node from one path to another.
             * @param {sntls.Path} fromPath
             * @param {sntls.Path} toPath
             * @returns {sntls.Tree}
             */
            moveNode: function (fromPath, toPath) {
                var node = this.getNode(fromPath);

                this
                    .unsetNode(fromPath)
                    .setNode(toPath, node);

                return this;
            },

            /**
             * Traverses tree recursively, guided by the specified query array
             * @param {sntls.Query} query
             * @param {function} handler
             * @returns {sntls.Tree}
             */
            traverseByQuery: function (query, handler) {
                // recursive tree walker may be guided by query expression
                sntls.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return this;
            },

            /**
             * Traverses tree iteratively, calling handler on every node
             * unless interrupted by returning false from handler.
             * @param {function} handler
             * @returns {sntls.Tree}
             */
            traverseAllNodes: function (handler) {
                // iterative walker operates unguided,
                // touching all nodes along traversal
                sntls.IterativeTreeWalker.create(handler)
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
                return Hash.create(this.queryValues(query));
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
                return Hash.create(this.queryKeys(query));
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
                return Hash.create(this.queryPaths(query));
            },

            /**
             * Queries key-value associations from tree as an object
             * @param {sntls.Query} query
             * @returns {object}
             */
            queryKeyValuePairs: function (query) {
                /*jshint validthis:true */
                var result = {};

                function handler(node) {
                    result[this.currentKey] = node;
                }

                // creating tree walker and walking tree buffer
                sntls.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return result;
            },

            /**
             * Queries key-value associations from tree as an object wrapped in a hash
             * @param {sntls.Query} query
             * @returns {sntls.Hash}
             */
            queryKeyValuePairsAsHash: function (query) {
                return Hash.create(this.queryKeyValuePairs(query));
            },

            /**
             * Queries pat-value associations from tree as object
             * @param {sntls.Query} query
             * @returns {object}
             */
            queryPathValuePairs: function (query) {
                /*jshint validthis:true */
                var result = {};

                function handler(node) {
                    result[this.currentPath.toString()] = node;
                }

                // creating tree walker and walking tree buffer
                sntls.RecursiveTreeWalker.create(handler, query)
                    .walk(this.items);

                return result;
            },

            /**
             * Queries pat-value associations from tree as object wrapped in a hash
             * @param {sntls.Query} query
             * @returns {sntls.Hash}
             */
            queryPathValuePairsAsHash: function (query) {
                return Hash.create(this.queryPathValuePairs(query));
            }
        });
});

troop.amendPostponed(sntls, 'Hash', function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash# */{
        /**
         * Reinterprets hash as a tree.
         * @returns {sntls.Tree}
         */
        toTree: function () {
            return sntls.Tree.create(this.items);
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

    troop.Properties.addProperties.call(
        Array.prototype,
        /** @lends Array# */{
            /**
             * Creates a new Tree instance based on the current array.
             * @returns {sntls.Tree}
             */
            toTree: function () {
                return sntls.Tree.create(this);
            }
        },
        false, false, false
    );
}());
