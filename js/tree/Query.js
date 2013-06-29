/*global dessert, troop, sntls, sntls */
troop.postpone(sntls, 'Query', function () {
    "use strict";

    var validators = dessert.validators,
        QueryPattern = sntls.QueryPattern,
        base = sntls.Path,
        self = base.extend();

    /**
     * Instantiates class.
     * Initializes query with a string or array. Keys in the query
     * (except for patterns) are assumed to be URI-encoded.
     * @name sntls.Query.create
     * @function
     * @param {Array|string} query
     * @returns {sntls.Query}
     * @example 'root>\\>persons>|>name'
     */

    /**
     * An expression that matches several paths.
     * Technically, queries can be interpreted as paths, ie. wherever a path is accepted,
     * so is a query.
     * @class sntls.Query
     * @extends sntls.Path
     */
    sntls.Query = self
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
            PATTERN_SKIP: QueryPattern.create(QueryPattern.SKIP_SYMBOL)
        })
        .addMethods(/** @lends sntls.Query# */{
            /**
             * @param {Array|string} query
             * @ignore
             */
            init: function (query) {
                var asArray, i, pattern;

                if (validators.isString(query)) {
                    // splitting string input
                    asArray = query.split(this.PATH_SEPARATOR);
                } else if (query instanceof Array) {
                    asArray = query;
                } else {
                    dessert.assert(false, "Invalid query", query);
                }

                for (i = 0; i < asArray.length; i++) {
                    pattern = asArray[i];
                    if (typeof pattern === 'string') {
                        if (pattern.indexOf(QueryPattern.SKIP_SYMBOL) === 0) {
                            // special skipper case
                            asArray[i] = this.PATTERN_SKIP;
                        } else  if (self.RE_QUERY_TESTER.test(pattern)) {
                            // pattern is query expression (as in not key literal)
                            // creating pattern instance
                            asArray[i] = QueryPattern.create(pattern);
                        }
                    } else if (QueryPattern.isBaseOf(pattern)) {
                        if (pattern.isSkipper()) {
                            // skipper patterns are substituted with constant
                            asArray[i] = QueryPattern.SKIP_SYMBOL;
                        }
                    } else {
                        dessert.assert(false, "Invalid query pattern", pattern);
                    }
                }

                // calling base w/ array only
                // base class handles assertions
                base.init.call(this, asArray);
            },

            /**
             * Extracts the longest fixed stem path from the query.
             * The stem may not contain any wildcards, or other
             * query expressions, only specific keys.
             * @returns {sntls.Path}
             */
            getStemPath: function () {
                var asArray = this.asArray,
                    result = [],
                    i, key;

                // stopping at first non-string key
                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (typeof key === 'string') {
                        result.push(key);
                    } else {
                        break;
                    }
                }

                return sntls.Path.create(result);
            },

            /**
             * Determines whether query matches specified path
             * @param {sntls.Path} path
             * @returns {boolean}
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

                    if (currentPattern === this.PATTERN_SKIP) {
                        // current pattern indicates skip mode 'on'
                        inSkipMode = true;
                        j++;
                    } else {
                        if (QueryPattern.isBaseOf(currentPattern) && currentPattern.matchesKey(currentKey) ||
                            currentPattern === currentKey
                            ) {
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
                       (i === pathAsArray.length || currentPattern === this.PATTERN_SKIP);
            },

            /**
             * Generates string representation of query.
             * @returns {string}
             */
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
     * @returns {sntls.Query}
     */
    String.prototype.toQuery = function () {
        return /** @type {sntls.Query} */ sntls.Query.create(this);
    };

    /**
     * @returns {sntls.Path}
     */
    String.prototype.toPathOrQuery = function () {
        return /** @type {sntls.Path} */ validators.isQueryExpression(this) ?
            sntls.Query.create(this) :
            sntls.Path.create(this);
    };

    /**
     * @returns {sntls.Query}
     */
    Array.prototype.toQuery = function () {
        return /** @type {sntls.Query} */ sntls.Query.create(this);
    };

    /**
     * @returns {sntls.Path}
     */
    Array.prototype.toPathOrQuery = function () {
        return /** @type {sntls.Path} */ validators.isQueryExpression(this) ?
            sntls.Query.create(this) :
            sntls.Path.create(this);
    };
}());
