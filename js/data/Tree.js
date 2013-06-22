/**
 * Tree
 *
 * Manages tree data structure
 */
/*global dessert, troop, sntls */
troop.postpone(sntls, 'Tree', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        Query = sntls.Query,
        validators = dessert.validators;

    /**
     * @class sntls.Tree
     * @extends sntls.Hash
     */
    sntls.Tree = sntls.Hash.extend()
        .addPrivateMethods(/** @lends sntls.Tree */{
            /**
             * Retrieves an array of keys from the node passed
             * according to the given pattern.
             * @param node {object} Node for which to obtain the keys.
             * @param pattern {Array} String, array of strings, or undefined
             * @return {string[]} Array of keys.
             * @private
             * @static
             */
            _getMatchingKeys: function (node, pattern) {
                var result,
                    i, key;
                if (validators.isString(pattern)) {
                    if (hOP.call(node, pattern)) {
                        result = [pattern];
                    } else {
                        result = [];
                    }
                } else if (pattern instanceof Array) {
                    result = [];
                    for (i = 0; i < pattern.length; i++) {
                        key = pattern[i];
                        if (hOP.call(node, key)) {
                            result.push(key);
                        }
                    }
                } else if (pattern === Query.PATTERN_ASTERISK) {
                    result = Object.keys(node);
                } else {
                    result = [];
                }
                return result;
            }
        })
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
                return path.resolve(this.items);
            },

            /**
             * Retrieves object at the specified path wrapped in a Hash object.
             * @param {sntls.Path} path Path to node
             * @return {sntls.Hash}
             */
            getNodeAsHash: function (path) {
                var node = path.resolve(this.items);
                dessert.isObjectOptional(node, "Node is not object");
                return node ?
                    sntls.Hash.create(node) :
                    node;
            },

            /**
             * Sets the node at the specified path to the given value.
             * @param {sntls.Path} path Path to node
             * @param {*} value Node value to set
             * @return {sntls.Tree}
             */
            setNode: function (path, value) {
                var node = path.clone().trim().resolveOrBuild(this.items),
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
            getSafeNode: function (path, generator) {
                var node = path.clone().trim().resolveOrBuild(this.items),
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
                var node = path.clone().trim().resolveOrBuild(this.items),
                    asArray = path.asArray,
                    lastKey = asArray[asArray.length - 1];

                delete node[lastKey];

                return this;
            },

            /**
             * Traverses tree recursively, guided by the specified query array
             * @param {*} node
             * @param {Array} queryAsArray Array representation of a sntls.Query object
             * @param {boolean} inSkipMode
             * @param {function} handler
             */
            traverseRecursively: function (node, queryAsArray, inSkipMode, handler) {
                if (!queryAsArray.length && (!inSkipMode || !(node instanceof Object))) {
                    // end of query reached
                    handler(node);
                    return this;
                } else if (!(node instanceof Object)) {
                    // leaf node reached
                    return this;
                }

                var currentPattern = queryAsArray[0], // current query pattern
                    currentKeys, // keys in node matching pattern
                    nextSkipMode, // skip mode for next level
                    nextQuery, // query for next level
                    i;

                if (currentPattern === Query.PATTERN_SKIP) {
                    // pattern indicates skip mode
                    currentKeys = Object.keys(node); // all keys are considered
                    nextSkipMode = true; // skip mode is ON for subsequent levels
                    nextQuery = queryAsArray.slice(1);
                } else {
                    // other patterns expressing single or multiple key match
                    // obtaining keys from node matching pattern
                    currentKeys = this._getMatchingKeys(node, currentPattern);
                    if (inSkipMode) {
                        if (!currentKeys.length) {
                            // no keys matched pattern, must skip to next level
                            nextSkipMode = inSkipMode; // skip mode remains ON
                            nextQuery = queryAsArray; // using same query (pattern)
                            currentKeys = Object.keys(node); // all keys must be considered when skipping
                        } else {
                            // at least one key matched pattern, ending skip mode
                            nextSkipMode = false; // switching skip mode OFF
                            nextQuery = queryAsArray.slice(1);
                        }
                    } else {
                        // not in skip mode, current
                        nextSkipMode = inSkipMode; // skip mode remains OFF
                        nextQuery = queryAsArray.slice(1);
                    }
                }

                // iterating over node keys and traversing sub-nodes
                for (i = 0; i < currentKeys.length; i++) {
                    this.traverseRecursively(node[currentKeys[i]], nextQuery, nextSkipMode, handler);
                }

                return this;
            },

            /**
             * Traverses all enumerable nodes in object.
             * Iterative implementation.
             * Calls handler on leaf nodes by default.
             * @param {sntls.Query} query Query expression guiding traversal.
             * @param {function} handler Called on each (leaf) node.
             */
            traverse: function (query, handler) {
                var rootNode = this.items,
                    keysStack = [this._getMatchingKeys(rootNode, query.asArray[0])], // stack of keys associated with each node on current path
                    indexStack = [0], // stack of key indexes on current path
                    nodeStack = [rootNode], // stack of nodes on current path

                    currentPath = [], // key stack, ie. traversal path, calculated
                    currentDepth, // current traversal depth
                    currentParent, // the node we're currently IN (current parent node)
                    currentKeys, // keys in the current parent node
                    currentIndex, // index of key in current parent node
                    currentKey, // key of node we're AT
                    currentNode, // node we're currently AT

                    isValidNode; // whether the current depth and index points to a valid node (object)

                for (; ;) {
                    // determining where we are
                    currentDepth = keysStack.length - 1;
                    currentIndex = indexStack[currentDepth];
                    currentKeys = keysStack[currentDepth];

                    // testing if current node finished traversal
                    if (currentIndex >= currentKeys.length) {
                        // going back a level
                        keysStack.pop();

                        if (!keysStack.length) {
                            // object is fully traversed, exiting
                            break;
                        }

                        nodeStack.pop();
                        indexStack.pop();
                        currentPath.pop();

                        // raising index on parent node
                        indexStack.push(indexStack.pop() + 1);
                    } else {
                        // obtaining current state as local variables
                        currentKey = currentKeys[currentIndex];
                        currentParent = nodeStack[currentDepth];
                        currentNode = currentParent[currentKey];
                        currentPath[currentDepth] = currentKey;

                        // determining whether current depth & index points to a node
                        isValidNode = currentNode instanceof Object &&
                                      nodeStack.indexOf(currentNode) === -1; // loop detection

                        // next step in traversal
                        if (isValidNode) {
                            // burrowing deeper - found a node
                            nodeStack.push(currentNode);
                            indexStack.push(0);
                            keysStack.push(this._getMatchingKeys(currentNode, query.asArray[currentDepth + 1]));
                        } else if (handler.call(currentNode, currentPath, currentKey, currentDepth) === false) {
                            // calling handler for this node
                            // traversal may be terminated by handler by returning false
                            break;
                        } else {
                            // moving to next node in parent
                            indexStack[currentDepth]++;
                        }
                    }
                }

                return this;
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
