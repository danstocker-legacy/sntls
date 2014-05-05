/*global dessert, troop, sntls */
troop.postpone(sntls, 'RecursiveTreeWalker', function () {
    "use strict";

    var base = sntls.TreeWalker,
        hOP = Object.prototype.hasOwnProperty;

    /**
     * Instantiates class
     * @name sntls.RecursiveTreeWalker.create
     * @function
     * @param {function} handler
     * @param {sntls.Query} [query]
     * @returns {sntls.RecursiveTreeWalker}
     */

    /**
     * Traverses tree recursively, according to a query expression.
     * @class sntls.RecursiveTreeWalker
     * @extends sntls.TreeWalker
     */
    sntls.RecursiveTreeWalker = base.extend()
        .addConstants(/** @lends sntls.RecursiveTreeWalker */{
            /**
             * Key-value pair marker character for marking return value.
             * Queries will collect leaf nodes unless there's a kvp in the query is marked like this.
             * @example
             * '\\>{world}>\\>|^foo'.toQuery() // query would retrieve "world" nodes w/ "foo" leaf nodes under it
             */
            RETURN_MARKER: '{'
        })
        .addPrivateMethods(/** @lends sntls.RecursiveTreeWalker */{
            /**
             * Gathers all indices of specified value from specified array.
             * @param {Array} array
             * @param {*} value
             * @returns {object}
             * @private
             */
            _allIndicesOf: function (array, value) {
                var result = {},
                    nextIndex = -1;
                while ((nextIndex = array.indexOf(value, nextIndex + 1)) > -1) {
                    result[nextIndex] = true;
                }
                return result;
            },

            /**
             * Gathers all keys associated with specified value from specified object
             * @param {object} object
             * @param {*} value
             * @returns {object}
             * @private
             */
            _getKeysByValue: function (object, value) {
                var result = {},
                    keys = Object.keys(object),
                    i, key;
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (object[key] === value) {
                        result[key] = true;
                    }
                }
                return result;
            },

            /**
             * Retrieves keys that are associated with traversable values (objects).
             * @param {object} object
             * @returns {object}
             * @private
             */
            _getKeysForObjectProperties: function (object) {
                var result = {},
                    keys = Object.keys(object),
                    i, key;
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (object[key] instanceof Object) {
                        result[key] = true;
                    }
                }
                return result;
            },

            /**
             * Retrieves an array of keys from the node passed
             * according to the given pattern.
             * @param {object} node Node for which to obtain the keys.
             * @param {string|sntls.KeyValuePattern} pattern
             * @returns {object} Lookup of suitable keys
             * @private
             */
            _getKeysByPattern: function (node, pattern) {
                var descriptor = pattern.descriptor,
                    result = {},
                    i, key;

                if (typeof pattern === 'string') {
                    // pattern is key literal
                    if (hOP.call(node, pattern)) {
                        // key is present in node
                        result[pattern] = true;
                    }
                } else if (descriptor instanceof Object) {
                    if (typeof descriptor.key === 'string') {
                        // descriptor has a single key specified
                        key = descriptor.key;
                        if (hOP.call(descriptor, 'value')) {
                            // descriptor has both key and value specified
                            if (descriptor.value === node[key]) {
                                result[key] = true;
                            }
                        } else {
                            // descriptor has only key specified
                            result[key] = true;
                        }
                    } else if (descriptor.options instanceof Array) {
                        // obtaining enumerated keys that are actually present in node
                        if (hOP.call(descriptor, 'value')) {
                            // value also expected to be matched
                            for (i = 0; i < descriptor.options.length; i++) {
                                key = descriptor.options[i];
                                if (node[key] === descriptor.value) {
                                    // key present in node with specified value assigned
                                    result[key] = true;
                                }
                            }
                        } else {
                            // only key is expected to be matched
                            for (i = 0; i < descriptor.options.length; i++) {
                                key = descriptor.options[i];
                                if (hOP.call(node, key)) {
                                    // key present in node
                                    result[key] = true;
                                }
                            }
                        }
                    } else if (descriptor.symbol === sntls.KeyValuePattern.WILDCARD_SYMBOL) {
                        if (hOP.call(descriptor, 'value')) {
                            // there's a value specified within pattern
                            if (node instanceof Array) {
                                // obtaining all matching indices from array
                                result = this._allIndicesOf(node, descriptor.value);
                            } else if (node instanceof Object) {
                                // obtaining all matching keys from object
                                result = this._getKeysByValue(node, descriptor.value);
                            }
                        } else {
                            // wildcard pattern
                            result = node;
                        }
                    }
                }

                return result;
            },

            /**
             * Calls handler after creating snapshot of traversal state.
             * @param {string[]} currentPath
             * @param {*} currentNode
             * @private
             */
            _callHandler: function (currentPath, currentNode) {
                // creating snapshot of state
                this.currentKey = currentPath[currentPath.length - 1];
                this.currentNode = currentNode;
                this.currentPath = currentPath.toPath();

                if (this.handler.call(this, currentNode) === false) {
                    this.terminateTraversal();
                }
            },

            /**
             * Traverses a set of keys under the specified parent node.
             * @param {string[]} parentPath
             * @param {*} parentNode
             * @param {sntls.Set} keySet
             * @param {number} queryPos Position of the current KPV in the query.
             * @param {boolean} isInSkipMode
             * @param {boolean} hasMarkedParent
             * @returns {boolean} Whether there was a hit under the current parentNode
             * @private
             */
            _traverseKeys: function (parentPath, parentNode, keySet, queryPos, isInSkipMode, hasMarkedParent) {
                var currentKeys = keySet.getKeys(),
                    result = false,
                    i, currentKey, currentNode;

                for (i = 0; i < currentKeys.length; i++) {
                    if (this.isTerminated) {
                        break;
                    }

                    currentKey = currentKeys[i];
                    currentNode = parentNode[currentKey];
                    result = this._walk(
                        parentPath.concat(currentKey),
                        currentNode,
                        queryPos,
                        isInSkipMode,
                        hasMarkedParent
                    ) || result;
                }

                return result;
            },

            /**
             * Traverses specified node recursively, according to the query assigned to the walker.
             * @param {string[]} currentPath
             * @param {*} currentNode
             * @param {number} queryPos Position of the current KPV in the query.
             * @param {boolean} isInSkipMode
             * @param {boolean} isUnderMarkedNode
             * @returns {boolean} Indicates whether there were any matching nodes under the current node.
             * @memberOf sntls.RecursiveTreeWalker#
             * @private
             */
            _walk: function (currentPath, currentNode, queryPos, isInSkipMode, isUnderMarkedNode) {
                var queryAsArray = this.query.asArray,
                    currentKvp = queryAsArray[queryPos],
                    result = false;

                if (currentKvp === sntls.Query.PATTERN_SKIP) {
                    // current pattern is skipper
                    // setting skip mode on, and moving on to next KVP in query
                    isInSkipMode = true;
                    queryPos++;
                    currentKvp = queryAsArray[queryPos];
                }

                if (queryPos >= queryAsArray.length) {
                    // query is done;
                    // by the time we get here, all preceding query patterns have been matched

                    if (!isUnderMarkedNode) {
                        // not under marked node, so current match can be registered
                        this._callHandler(currentPath, currentNode);
                    }

                    // indicating match
                    return true;
                }

                var matchingKeySet = sntls.Set.create(this._getKeysByPattern(currentNode, currentKvp)),
                    parentKvp = queryAsArray[queryPos - 1],
                    hasMarkedParent = sntls.KeyValuePattern.isBaseOf(parentKvp) &&
                                      parentKvp.getMarker() === this.RETURN_MARKER;

                if (matchingKeySet.getKeyCount()) {
                    // there is at leas one matching key in the current node

                    // traversing matching properties
                    result = this._traverseKeys(
                        currentPath,
                        currentNode,
                        matchingKeySet,
                        queryPos + 1,   // goes on to next KVP
                        false,          // matching key resets skip mode
                        hasMarkedParent || isUnderMarkedNode
                    ) || result;
                }

                var objectKeySet,
                    traversableKeySet;

                if (isInSkipMode) {
                    // we're in skip mode so rest of the keys under the current node must be traversed

                    // obtaining keys for properties that can be traversed
                    objectKeySet = sntls.Set.create(this._getKeysForObjectProperties(currentNode));
                    traversableKeySet = matchingKeySet.subtractFrom(objectKeySet);

                    if (traversableKeySet.getKeyCount()) {
                        result = this._traverseKeys(
                            currentPath,
                            currentNode,
                            traversableKeySet,
                            queryPos,   // continues to look for current KVP
                            true,       // keeps skip mode switched on
                            hasMarkedParent || isUnderMarkedNode
                        ) || result;
                    }
                }

                if (hasMarkedParent && result) {
                    // there was a hit under the current node,
                    // and immediate parent is marked for return
                    this._callHandler(currentPath, currentNode);
                }

                return result;
            }
        })
        .addMethods(/** @lends sntls.RecursiveTreeWalker# */{
            /**
             * @param {function} handler
             * @param {sntls.Query} [query]
             * @ignore
             */
            init: function (handler, query) {
                dessert.isQueryOptional(query, "Invalid query");

                base.init.call(this, handler);

                /**
                 * Query guiding the traversal.
                 * @type {sntls.Query}
                 */
                this.query = query || '\\'.toQuery();
            },

            /**
             * Walks the specified node according to query
             * @param {*} node
             * @returns {sntls.RecursiveTreeWalker}
             */
            walk: function (node) {
                // initializing traversal path state
                this.currentPath = sntls.Path.create([]);

                // walking node
                this._walk([], node, 0, false, false);

                // traversal finished, resetting traversal state
                this.reset();

                return this;
            }
        });
});
