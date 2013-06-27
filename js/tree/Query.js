/**
 * Path Query
 *
 * An expression that may match several paths.
 * Queries may be interpreted as paths themselves. (Wherever
 * a path is accepted, so is a query.)
 *
 * Patterns:
 *  - '<' for expressing OR relationship between keys
 *  - '|' for matching any string on a key
 *  - '\' for skipping keys until next pattern is matched
 *
 * Example: 'root>\\>persons>|>name' would match the name field
 * of all 'person' documents in a tree.
 */
/*global dessert, troop, sntls, sntls */
troop.postpone(sntls, 'Query', function () {
    "use strict";

    var validators = dessert.validators,
        base = sntls.Path;

    /**
     * @class sntls.Query
     * @extends sntls.Path
     */
    sntls.Query = base.extend()
        .addConstants(/** @lends sntls.Query */{
            /**
             * Regular expression that tests whether string
             * contains query patterns.
             * @type {RegExp}
             */
            RE_QUERY_TESTER: /<|\^|\||\\/,

            /**
             * Regular expression validating a query expression
             * @type {RegExp}
             */
            RE_QUERY_VALIDATOR: /^(>?(\||\\|[^<>\^\|\\]*|(<?[^<>\^\|\\]*)+)(\^[^<>\^\|\\]*$)?)+$/,

            /**
             * Pattern indicating skip mode. In skip mode, keys are skipped
             * in the path between the previous key and the nearest key matched
             * by the next pattern in the query.
             * @type {sntls.QueryPattern}
             */
            PATTERN_SKIP: sntls.QueryPattern.create('\\')
        })
        .addMethods(/** @lends sntls.Query */{
            /**
             * @name sntls.Query.create
             * @return {sntls.Query}
             */

            /**
             * Initializes query with a string or array. Keys in the query
             * (except for patterns) are assumed to be URI-encoded.
             * @param {Array|string} query
             */
            init: function (query) {
                /**
                 * @memberOf sntls.Query
                 * @type {sntls.QueryPattern[]}
                 */
                var asArray,
                    QueryPattern = sntls.QueryPattern;

                if (validators.isString(query)) {
                    // splitting string input
                    query = query.split(this.PATH_SEPARATOR);
                }

                if (query instanceof Array) {
                    asArray = sntls.Collection.create(query)
                        .mapContents(function (item) {
                            // making sure buffer items are QueryPattern instances
                            if (QueryPattern.isBaseOf(item)) {
                                return item;
                            } else {
                                return QueryPattern.create(item);
                            }
                        })
                        .items;
                }

                // calling base w/ array only
                // base class handles assertions
                base.init.call(this, asArray);
            },

            /**
             * Extracts the longest fixed stem path from the query.
             * The stem may not contain any wildcards, or other
             * query expressions, only specific keys.
             * @return {sntls.Path}
             */
            getStemPath: function () {
                var asArray = this.asArray,
                    result = [],
                    i, key;

                // stopping at first non-string key
                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (typeof key.descriptor === 'string') {
                        result.push(key.descriptor);
                    } else {
                        break;
                    }
                }

                return sntls.Path.create(result);
            },

            /**
             * Determines whether query matches specified path
             * @param {sntls.Path} path
             * @return {boolean}
             */
            matchesPath: function (path) {
                var queryAsArray = this.asArray,
                    pathAsArray = path.asArray,
                    i = 0, currentKey,
                    j = 0, currentPattern,
                    inSkipMode = false;

                while (i < pathAsArray.length && j < queryAsArray.length) {
                    currentKey = pathAsArray[i];
                    currentPattern = queryAsArray[j];

                    if (currentPattern.isSkipper()) {
                        // current pattern indicates skip mode 'on'
                        inSkipMode = true;
                        j++;
                    } else {
                        if (currentPattern.matchesKey(currentKey)) {
                            // current key matches current pattern
                            // turning skip mode off
                            inSkipMode = false;
                            j++;
                        } else if (!inSkipMode) {
                            // current key does not match current pattern and not in skip mode
                            // matching failed
                            return false;
                        }

                        // proceeding to next key in path
                        i++;
                    }
                }

                // matching was successful when query was fully processed
                // and path was either fully processed or last pattern was continuation
                return j === queryAsArray.length &&
                       (i === pathAsArray.length || currentPattern.isSkipper());
            },

            toString: function () {
                var asArray = this.asArray,
                    result = [],
                    i;

                for (i = 0; i < asArray.length; i++) {
                    result.push(asArray[i].toString());
                }

                return result.join(this.PATH_SEPARATOR);
            }
        });
});

(function () {
    "use strict";

    var validators = dessert.validators;

    dessert.addTypes(/** @lends dessert */{
        isQuery: function (expr) {
            return sntls.Query.isBaseOf(expr);
        },

        isQueryOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Query.isBaseOf(expr);
        },

        /**
         * Determines whether specified string or array path qualifies as query.
         * @path {string|string[]} Path in string or array representation
         */
        isQueryExpression: function (expr) {
            var i;
            if (expr instanceof Array) {
                for (i = 0; i < expr.length; i++) {
                    // any object in the path qualifies for query
                    if (expr[i] instanceof Object) {
                        return true;
                    }
                }
            } else if (this.isString(expr)) {
                return sntls.Query.RE_QUERY_TESTER.test(expr);
            }
            return false;
        }
    });

    /**
     * @return {sntls.Query}
     */
    String.prototype.toQuery = function () {
        return /** @type {sntls.Query} */ sntls.Query.create(this);
    };

    /**
     * @return {sntls.Path}
     */
    String.prototype.toPathOrQuery = function () {
        return /** @type {sntls.Path} */ validators.isQueryExpression(this) ?
            sntls.Query.create(this) :
            sntls.Path.create(this);
    };

    /**
     * @return {sntls.Query}
     */
    Array.prototype.toQuery = function () {
        return /** @type {sntls.Query} */ sntls.Query.create(this);
    };

    /**
     * @return {sntls.Path}
     */
    Array.prototype.toPathOrQuery = function () {
        return /** @type {sntls.Path} */ validators.isQueryExpression(this) ?
            sntls.Query.create(this) :
            sntls.Path.create(this);
    };
}());
