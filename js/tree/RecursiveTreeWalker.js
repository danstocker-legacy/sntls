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
             * @returns {number[]}
             * @private
             */
            _allIndicesOf: function (array, value) {
                var result = [],
                    nextIndex = -1;
                while ((nextIndex = array.indexOf(value, nextIndex + 1)) > -1) {
                    result.push(nextIndex);
                }
                return result;
            },

            /**
             * Gathers all keys associated with specified value from specified object
             * @param {object} object
             * @param {*} value
             * @returns {string[]}
             * @private
             */
            _getKeysByValue: function (object, value) {
                var result = [],
                    keys = Object.keys(object),
                    i, key;
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (object[key] === value) {
                        result.push(key);
                    }
                }
                return result;
            },

            /**
             * Retrieves keys that are associated with traversable values (objects).
             * @param {object} object
             * @returns {string[]}
             * @private
             */
            _getKeysForObjectProperties: function (object) {
                var result = [],
                    keys = Object.keys(object),
                    i, key;
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (object[key] instanceof Object) {
                        result.push(key);
                    }
                }
                return result;
            },

            /**
             * Retrieves an array of keys from the node passed
             * according to the given pattern.
             * @param {object} node Node for which to obtain the keys.
             * @param {string|sntls.KeyValuePattern} pattern
             * @returns {string[]} Array of keys.
             * @private
             */
            _getKeysByPattern: function (node, pattern) {
                var descriptor = pattern.descriptor,
                    result,
                    i, key;

                if (typeof pattern === 'string') {
                    // pattern is key literal
                    if (hOP.call(node, pattern)) {
                        // key is present in node
                        result = [pattern];
                    } else {
                        // key is not present in node
                        result = [];
                    }
                } else if (descriptor instanceof Object) {
                    if (typeof descriptor.key === 'string') {
                        // descriptor has a single key specified
                        key = descriptor.key;
                        if (hOP.call(descriptor, 'value')) {
                            // descriptor has both key and value specified
                            result = descriptor.value === node[key] ? [key] : [];
                        } else {
                            // descriptor has only key specified
                            result = [key];
                        }
                    } else if (descriptor.options instanceof Array) {
                        // obtaining enumerated keys that are actually present in node
                        result = [];
                        if (hOP.call(descriptor, 'value')) {
                            // value also expected to be matched
                            for (i = 0; i < descriptor.options.length; i++) {
                                key = descriptor.options[i];
                                if (node[key] === descriptor.value) {
                                    // key present in node with specified value assigned
                                    result.push(key);
                                }
                            }
                        } else {
                            // only key is expected to be matched
                            for (i = 0; i < descriptor.options.length; i++) {
                                key = descriptor.options[i];
                                if (hOP.call(node, key)) {
                                    // key present in node
                                    result.push(key);
                                }
                            }
                        }
                    } else if (descriptor.symbol === sntls.KeyValuePattern.WILDCARD_SYMBOL) {
                        if (hOP.call(descriptor, 'value')) {
                            // there's a value specified within pattern
                            if (node instanceof Array) {
                                // obtaining all matching indices from array
                                result = this._allIndicesOf(node, descriptor.value);
                            } else {
                                // obtaining all matching keys from object
                                result = this._getKeysByValue(node, descriptor.value);
                            }
                        } else {
                            // wildcard pattern
                            result = Object.keys(node);
                        }
                    }
                } else {
                    // descriptor is unrecognizable
                    result = [];
                }

                return result;
            },

            /**
             * Traverses specified node recursively, according to the query assigned to the walker.
             * @param {*} currentNode Node currently being traversed.
             * @param {number} queryPos Position of current pattern in query.
             * @param {boolean} inSkipMode Whether traversal is in skip mode.
             * @param {boolean} isMarked Whether current node is under a marked node.
             * @returns {boolean} Indicates whether there were any matching nodes under the current node.
             * @memberOf sntls.RecursiveTreeWalker#
             * @private
             */
            _walk: function (currentNode, queryPos, inSkipMode, isMarked) {
                var PATTERN_SKIP = sntls.Query.PATTERN_SKIP,
                    queryAsArray = this.query.asArray,
                    atLeafNode = typeof currentNode !== 'object', // we're at a leaf node
                    queryProcessed = queryPos >= queryAsArray.length, // no patterns left in query to process
                    currentPattern = queryAsArray[queryPos], // current key-value pattern
                    currentMarked = sntls.KeyValuePattern.isBaseOf(currentPattern) &&
                                    currentPattern.getMarker() === this.RETURN_MARKER,
                    currentKeys, // keys in node matching pattern
                    i, currentKey, // identifies key in currentKeys
                    currentResult, // result of walking node under current key
                    nextSkipMode, // skip mode for next level
                    nextQueryPos, // position of next pattern in query
                    result = false;

                if (queryProcessed) {
                    // end of query reached
                    if (!inSkipMode || atLeafNode) {
                        // not in skip mode (any node will be returned), or,
                        // in skip mode and leaf node reached (last pattern in query was skip)
                        // handler only called for matching nodes not under marked node
                        if (!isMarked && this.handler.call(this, currentNode) === false) {
                            // handler returned false =>
                            // terminating traversal
                            this.terminateTraversal();
                        }

                        // signaling matching path
                        return true;
                    } else {
                        // in skip mode and not at leaf node
                        // keeping (pseudo-) pattern
                        currentPattern = PATTERN_SKIP;
                    }
                } else if (atLeafNode) {
                    // leaf node reached but query not done
                    // ignoring such leaf nodes
                    return false;
                }

                if (currentPattern === PATTERN_SKIP) {
                    // pattern indicates skip mode
                    currentKeys = Object.keys(currentNode); // all keys are considered
                    nextSkipMode = true; // skip mode is ON for subsequent levels
                    nextQueryPos = queryPos + 1;
                } else {
                    // other patterns expressing single or multiple key match
                    // obtaining keys from node matching pattern
                    currentKeys = this._getKeysByPattern(currentNode, currentPattern);
                    if (inSkipMode) {
                        if (!currentKeys.length) {
                            // no keys matched pattern, must skip to next level
                            nextSkipMode = inSkipMode; // skip mode remains ON
                            nextQueryPos = queryPos; // same pattern will be used on next level
                            currentKeys = this._getKeysForObjectProperties(currentNode); // keys to all object type properties
                        } else {
                            // at least one key matched pattern, ending skip mode
                            nextSkipMode = false; // switching skip mode OFF
                            nextQueryPos = queryPos + 1;
                        }
                    } else {
                        // not in skip mode, current
                        nextSkipMode = inSkipMode; // skip mode remains OFF
                        nextQueryPos = queryPos + 1;
                    }
                }

                // iterating over node keys and traversing sub-nodes
                for (i = 0; i < currentKeys.length; i++) {
                    currentKey = currentKeys[i];

                    // preparing traversal state for next level
                    this.currentKey = currentKey;
                    this.currentNode = currentNode[currentKey];
                    this.currentPath.asArray.push(currentKey);

                    // walking next level
                    // changes traversal state!
                    currentResult = this._walk(this.currentNode, nextQueryPos, nextSkipMode, isMarked || currentMarked);

                    if (currentResult === true && currentMarked) {
                        // there was a match below the current node and current node is marked

                        // restoring traversal state for handler
                        this.currentKey = currentKey;
                        this.currentNode = currentNode[currentKey];

                        // calling handler on current (marked) node
                        if (this.handler.call(this, this.currentNode) === false) {
                            this.terminateTraversal();
                        }
                    }

                    // reverting traversal state for this level
                    this.currentPath.asArray.pop();

                    if (this.isTerminated) {
                        // ending terminated traversal
                        return false;
                    } else if (currentResult === true && isMarked && !currentMarked) {
                        // current node is under a marked one but it is not a marked one itself
                        // (for marked nodes all current keys must be walked)
                        // no need to check the rest of current keys
                        return true;
                    } else {
                        // aggregating result for current keys
                        result = result || currentResult;
                    }
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
                this._walk(node, 0, false, false);

                // traversal finished, resetting traversal state
                this.reset();

                return this;
            }
        });
});
