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
             * Traverses tree recursively, guided by the specified query array
             * @param {*} node
             * @param {number} queryPos
             * @param {boolean} inSkipMode
             */
            _walk: function (node, queryPos, inSkipMode) {
                var queryAsArray = this.query.asArray,
                    atLeafNode = typeof node !== 'object', // we're at a leaf node
                    queryProcessed = queryPos >= queryAsArray.length, // no patterns left in query to process
                    currentPattern = queryAsArray[queryPos], // current query pattern
                    currentKeys, // keys in node matching pattern
                    nextSkipMode, // skip mode for next level
                    nextQueryPos, // position of next pattern
                    i;

                if (queryProcessed) {
                    // end of query reached
                    if (!inSkipMode || atLeafNode) {
                        // not in skip mode (any node will be returned), or,
                        // in skip mode and leaf node reached (last pattern in query was skip)
                        // calling handler
                        this.handler(node);
                        return this;
                    } else {
                        // in skip mode and not at leaf node
                        // keeping (pseudo-) pattern
                        currentPattern = Query.PATTERN_SKIP;
                    }
                } else if (atLeafNode) {
                    // leaf node reached but query not done
                    // ignoring such leaf nodes
                    return this;
                }

                if (currentPattern === Query.PATTERN_SKIP) {
                    // pattern indicates skip mode
                    currentKeys = Object.keys(node); // all keys are considered
                    nextSkipMode = true; // skip mode is ON for subsequent levels
                    nextQueryPos = queryPos + 1;
                } else {
                    // other patterns expressing single or multiple key match
                    // obtaining keys from node matching pattern
                    currentKeys = this.getKeysByPattern(node, currentPattern);
                    if (inSkipMode) {
                        if (!currentKeys.length) {
                            // no keys matched pattern, must skip to next level
                            nextSkipMode = inSkipMode; // skip mode remains ON
                            nextQueryPos = queryPos; // same pattern will be used on next level
                            currentKeys = Object.keys(node); // all keys must be considered when skipping
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
                    this._walk(node[currentKeys[i]], nextQueryPos, nextSkipMode);
                }

                return this;
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
                 * @type {Function}
                 */
                this.handler = handler;
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
                this._walk(node, 0, false);
                return this;
            }
        });
});