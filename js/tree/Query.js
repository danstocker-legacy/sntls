/*global dessert, troop, sntls, sntls */
troop.postpone(sntls, 'Query', function () {
    "use strict";

    var KeyValuePattern = sntls.KeyValuePattern,
        base = sntls.Path;

    /**
     * Instantiates class.
     * Constructs query instance and populates it with query information. Keys in the query
     * (except for pattern objects) are assumed to be URI-encoded.
     * @name sntls.Query.create
     * @function
     * @param {Array} query Query in array representation (eg. ['this', 'is', '|'.toKeyValuePattern(), 'path']).
     * All patterns should be converted to KeyValuePattern instance.
     * @returns {sntls.Query}
     */

    /**
     * An expression that matches several paths.
     * Queries are backwards-compatible in the sense that a path instance may be treated as a query
     * that matches a single path.
     * A series of symbols may be used in specifying a query:
     * There are three symbols that match keys:
     * - '|' (pipe) matches all values on a key. Eg. 'hello>|>world' would match 'hello>dear>world'
     *  as well as 'hello>>world'.
     * - '<' separates optional key values. Eg. 'hello>world<all' would match 'hello>world' and 'hello>all'
     *  but not 'hello>people'.
     * - '\' skips all keys until next pattern in the query is matched. Eg. 'hello>\>world' would match
     * 'hello>people>of>the>world' as well as 'hello>world', but not 'hello>all'.
     * - '^value' is ignored.
     * On top of that, individual key-value patterns may be marked as return values by placing them inside curly braces.
     * @class sntls.Query
     * @extends sntls.Path
     */
    sntls.Query = base.extend()
        .addConstants(/** @lends sntls.Query */{
            /**
             * Regular expression that tests whether string contains query patterns.
             * Should include all special KeyValuePattern characters.
             * @type {RegExp}
             */
            RE_QUERY_TESTER: new RegExp([
                '\\' + sntls.KeyValuePattern.OPTION_SEPARATOR,
                '\\' + sntls.KeyValuePattern.KEY_VALUE_SEPARATOR,
                '\\' + sntls.KeyValuePattern.WILDCARD_SYMBOL,
                '\\' + sntls.KeyValuePattern.PRIMITIVE_SYMBOL,
                '\\' + sntls.KeyValuePattern.SKIP_SYMBOL,
                '\\' + sntls.KeyValuePattern.MARKER_BRACKET,
                '\\' + sntls.KeyValuePattern.MARKER_CURLY
            ].join('|')),

            /**
             * Pattern indicating skip mode. In skip mode, keys are skipped
             * in the path between the previous key and the nearest key matched
             * by the next pattern in the query.
             * @type {sntls.KeyValuePattern}
             */
            PATTERN_SKIP: KeyValuePattern.create(KeyValuePattern.SKIP_SYMBOL)
        })
        .addMethods(/** @lends sntls.Query# */{
            /**
             * Prepares string query buffer for normalization.
             * @param {string} asString Array of strings
             * @returns {string[]|sntls.KeyValuePattern[]}
             * @memberOf sntls.Query
             */
            stringToQueryArray: function (asString) {
                var asArray = asString.split(this.PATH_SEPARATOR),
                    result = [],
                    i, pattern;

                for (i = 0; i < asArray.length; i++) {
                    pattern = asArray[i];
                    if (pattern.indexOf(KeyValuePattern.SKIP_SYMBOL) === 0) {
                        // special skipper case
                        result.push(this.PATTERN_SKIP);
                    } else if (this.RE_QUERY_TESTER.test(pattern)) {
                        // pattern is query expression (as in not key literal)
                        // creating pattern instance
                        result.push(KeyValuePattern.create(pattern));
                    } else {
                        // pattern is key literal
                        result.push(decodeURI(pattern));
                    }
                }

                return result;
            },

            /**
             * Normalizes query buffer. Leaves key literals as they are,
             * converts array pattern expressions to actual pattern objects.
             * Makes sure skipper patterns all reference the same instance.
             * @param {string[]|sntls.KeyValuePattern[]} asArray
             * @returns {string[]|sntls.KeyValuePattern[]}
             * @memberOf sntls.Query
             */
            arrayToQueryArray: function (asArray) {
                var result = [],
                    i, pattern;

                for (i = 0; i < asArray.length; i++) {
                    pattern = asArray[i];
                    if (typeof pattern === 'string') {
                        // pattern is key literal
                        result.push(pattern);
                    } else if (pattern instanceof Array) {
                        // array is turned into pattern instance
                        result.push(KeyValuePattern.create(pattern));
                    } else if (KeyValuePattern.isBaseOf(pattern)) {
                        if (pattern.isSkipper()) {
                            // skipper patterns are substituted with constant
                            result.push(this.PATTERN_SKIP);
                        } else {
                            // other patterns are copied 1:1
                            result.push(pattern);
                        }
                    } else {
                        dessert.assert(false, "Invalid key-value pattern", pattern);
                    }
                }

                return result;
            },

            /**
             * Extracts the longest path from the start of the query.
             * Stem may not contain any wildcards, or other query expressions, only key literals.
             * @example
             * sntls.Query.create('hello>world>|>foo>\>bar').getStemPath(); // path 'hello>world'
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
             * Determines whether the specified path matches the current query.
             * @param {sntls.Path} path Path to be tested against the current query.
             * @returns {boolean}
             */
            matchesPath: function (path) {
                var queryAsArray = this.asArray,
                    pathAsArray = path.asArray,
                    i = 0, currentKey,
                    j = 0, currentPattern,
                    inSkipMode = false;

                // loop goes on until path is fully processed
                // or a hard key mismatch is encountered
                while (i < pathAsArray.length) {
                    currentKey = pathAsArray[i];
                    currentPattern = queryAsArray[j];

                    if (currentPattern === this.PATTERN_SKIP) {
                        // current pattern indicates skip mode 'on'
                        inSkipMode = true;
                        j++;
                    } else {
                        if (KeyValuePattern.isBaseOf(currentPattern) && currentPattern.matchesKey(currentKey) ||
                            currentPattern === currentKey
                            ) {
                            // current key matches current pattern
                            // turning skip mode off
                            inSkipMode = false;
                            j++;
                        } else if (!inSkipMode) {
                            // current key does not match current pattern and not in skip mode
                            // hard key mismatch -> matching failed
                            return false;
                        }

                        // proceeding to next key in path
                        i++;
                    }
                }

                if (j < queryAsArray.length) {
                    // if path reached its end but the query hasn't
                    // seeing if remaining key-value patterns are just skippers
                    while (queryAsArray[j] === this.PATTERN_SKIP) {
                        // skippers at end are allowed
                        j++;
                    }
                }

                // matching was successful when query was fully processed
                // and path was either fully processed or last pattern was continuation
                return j === queryAsArray.length &&
                       (i === pathAsArray.length || currentPattern === this.PATTERN_SKIP);
            },

            /**
             * Determines whether paths matched by current query may be roots of the specified path.
             * @param {sntls.Path} relativePath
             * @returns {boolean}
             * @example
             * 'foo>|>bar'.toQuery().isRootOf('foo>baz>bar>hello'.toPath()) // true
             */
            isRootOf: function (relativePath) {
                return this.clone()
                    .appendKey(this.PATTERN_SKIP)
                    .matchesPath(relativePath);
            },

            /**
             * Returns the string representation for the query, keys URI encoded and separated by '>',
             * patterns converted back to their symbol form ('|', '\', '<', and '^').
             * @example
             * sntls.Query.create(['test^', '|'.toKeyValuePattern(), 'path']).toString() // "test%5E>|>path"
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

    troop.Properties.addProperties.call(
        String.prototype,
        /** @lends String# */{
            /**
             * Creates a new Query instance based on the current string.
             * Keys are URI decoded or translated to the corresponding pattern object before being added to the internal buffer.
             * @returns {sntls.Query}
             */
            toQuery: function () {
                var Query = sntls.Query;
                return /** @type {sntls.Query} */ Query.create(Query.stringToQueryArray(this));
            },

            /**
             * Creates a new Path or Query instance based on the current string, depending on the
             * actual string contents.
             * @returns {sntls.Path}
             */
            toPathOrQuery: function () {
                var Query = sntls.Query;
                return /** @type {sntls.Path} */ validators.isQueryExpression(this) ?
                    this.toQuery() :
                    this.toPath();
            }
        },
        false, false, false
    );

    troop.Properties.addProperties.call(
        Array.prototype,
        /** @lends Array# */{
            /**
             * Creates a new Query instance based on the current array.
             * @returns {sntls.Query}
             */
            toQuery: function () {
                var Query = sntls.Query;
                return /** @type {sntls.Query} */ Query.create(Query.arrayToQueryArray(this));
            },

            /**
             * Creates a new Path or Query instance based on the current array, depending on the
             * actual contents of the array.
             * @returns {sntls.Path}
             */
            toPathOrQuery: function () {
                return /** @type {sntls.Path} */ validators.isQueryExpression(this) ?
                    this.toQuery() :
                    this.toPath();
            }
        },
        false, false, false
    );
}());
