/*global dessert, troop, sntls */
troop.postpone(sntls, 'RecursiveTreeWalker', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        Query = sntls.Query,
        validators = dessert.validators;

    /**
     * @class sntls.RecursiveTreeWalker
     * @extends troop.Base
     */
    sntls.RecursiveTreeWalker = troop.Base.extend()
        .addPrivateMethods(/** @lends sntls.RecursiveTreeWalker */{
            /**
             * Resets walker state
             * @private
             */
            _reset: function () {
                this.currentKey = undefined;
                this.currentNode = undefined;
                this.currentPath = undefined;
            },

            /**
             * Traverses tree recursively, guided by the query assigned to the walker.
             * @param {*} currentNode Node currently being traversed.
             * @param {number} queryPos Position of current pattern in query.
             * @param {boolean} inSkipMode Whether traversal is in skip mode.
             */
            _walk: function (currentNode, queryPos, inSkipMode) {
                var queryAsArray = this.query.asArray,
                    atLeafNode = typeof currentNode !== 'object', // we're at a leaf node
                    queryProcessed = queryPos >= queryAsArray.length, // no patterns left in query to process
                    currentPattern = queryAsArray[queryPos], // current query pattern
                    currentKeys, // keys in node matching pattern
                    nextSkipMode, // skip mode for next level
                    nextQueryPos, // position of next pattern
                    i, currentKey;

                if (queryProcessed) {
                    // end of query reached
                    if (!inSkipMode || atLeafNode) {
                        // not in skip mode (any node will be returned), or,
                        // in skip mode and leaf node reached (last pattern in query was skip)
                        // calling handler
                        return this.handler.call(this, currentNode);
                    } else {
                        // in skip mode and not at leaf node
                        // keeping (pseudo-) pattern
                        currentPattern = Query.PATTERN_SKIP;
                    }
                } else if (atLeafNode) {
                    // leaf node reached but query not done
                    // ignoring such leaf nodes
                    return true;
                }

                if (currentPattern === Query.PATTERN_SKIP) {
                    // pattern indicates skip mode
                    currentKeys = Object.keys(currentNode); // all keys are considered
                    nextSkipMode = true; // skip mode is ON for subsequent levels
                    nextQueryPos = queryPos + 1;
                } else {
                    // other patterns expressing single or multiple key match
                    // obtaining keys from node matching pattern
                    currentKeys = this.getKeysByPattern(currentNode, currentPattern);
                    if (inSkipMode) {
                        if (!currentKeys.length) {
                            // no keys matched pattern, must skip to next level
                            nextSkipMode = inSkipMode; // skip mode remains ON
                            nextQueryPos = queryPos; // same pattern will be used on next level
                            currentKeys = Object.keys(currentNode); // all keys must be considered when skipping
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
                    if (this._walk(this.currentNode, nextQueryPos, nextSkipMode) === false) {
                        return false;
                    }

                    // reverting traversal state for this level
                    this.currentKey = currentKey;
                    this.currentNode = currentNode;
                    this.currentPath.asArray.pop();
                }

                return true;
            }
        })
        .addMethods(/** @lends sntls.RecursiveTreeWalker */{
            /**
             * @name sntls.RecursiveTreeWalker.create
             * @return {sntls.RecursiveTreeWalker}
             */

            /**
             * @param {sntls.Query} query
             * @param {function} handler
             */
            init: function (query, handler) {
                /**
                 * Query guiding the traversal.
                 * @type {sntls.Query}
                 */
                this.query = query;

                /**
                 * Handler to be called on each leaf node.
                 * Returning false interrupts traversal.
                 * @type {Function}
                 */
                this.handler = handler;

                /**
                 * Key currently being traversed
                 * @type {string}
                 */
                this.currentKey = undefined;

                /**
                 * Node currently being traversed
                 * @type {*}
                 */
                this.currentNode = undefined;

                /**
                 * Path currently being traversed
                 * @type {sntls.Path}
                 */
                this.currentPath = undefined;
            },

            /**
             * Retrieves an array of keys from the node passed
             * according to the given pattern.
             * @param node {object} Node for which to obtain the keys.
             * @param pattern {Array} String, array of strings, or undefined
             * @return {string[]} Array of keys.
             * @static
             */
            getKeysByPattern: function (node, pattern) {
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
                this._walk(node, 0, false);

                // traversal finished, resetting traversal state
                this._reset();

                return this;
            }
        });
});