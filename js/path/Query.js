/*global dessert, troop, sntls, sntls */
troop.promise(sntls, 'Query', function () {
    "use strict";

    var base = sntls.Path;

    /**
     * @class sntls.Query
     * @extends sntls.Path
     */
    sntls.Query = base.extend()
        .addConstant(/** @lends sntls.Query */{
            /**
             * Query validator regexp
             * @type {RegExp}
             */
            RE_QUERY_VALIDATOR: /^[^><]+(<[^><]+)*(>[^><]+(<[^><]+)*)*$/,

            /**
             * Pattern that matches any key on a single level.
             * @type {object}
             */
            PATTERN_ASTERISK: {symbol: '|'},

            /**
             * Pattern indicating skip mode. In skip mode, keys are skipped
             * in the path between the previous key and the nearest key matched
             * by the next pattern in the query.
             * @type {object}
             */
            PATTERN_SKIP: {symbol: '\\'}
        })
        .addPrivateMethod(/** @lends sntls.Query */{
            /**
             * URI decodes all items of an array.
             * @param {Array} asArray Array of URI-encoded strings, sub-arrays, or objects
             * @return {Array} Array w/ all strings within URI-encoded
             * @private
             */
            _encodeURI: function (asArray) {
                var result = [],
                    i, key;
                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (key instanceof Array) {
                        result.push(this._encodeURI(key));
                    } else if (typeof key === 'string') {
                        result.push(encodeURI(key));
                    } else {
                        result.push(key);
                    }
                }
                return result;
            },

            /**
             * URI decodes all items of an array.
             * @param {Array} asArray Array of URI-encoded strings, sub-arrays, or objects
             * @return {Array} Array w/ all strings within URI-decoded
             * @private
             */
            _decodeURI: function (asArray) {
                var result = [],
                    i, key;
                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (key instanceof Array) {
                        result.push(this._decodeURI(key));
                    } else if (typeof key === 'string') {
                        result.push(decodeURI(key));
                    } else {
                        result.push(key);
                    }
                }
                return result;
            },

            /**
             * Parses string representation of query and returns an array.
             * @param {string} query
             * @return {Array}
             * @private
             */
            _parseString: function (query) {
                var result = query.split('>'),
                    i, key;

                for (i = 0; i < result.length; i++) {
                    key = result[i];
                    switch (key) {
                    case '|':
                        result[i] = this.PATTERN_ASTERISK;
                        break;
                    case '\\':
                        result[i] = this.PATTERN_SKIP;
                        break;
                    default:
                        if (key.indexOf('<') > -1) {
                            result[i] = key.split('<');
                        }
                        break;
                    }
                }

                return result;
            },

            /**
             * Matches a path key to a query pattern
             * @param {string} key
             * @param {string|object|string[]} pattern
             * @return {Boolean}
             * @private
             */
            _matchKeyToPattern: function (key, pattern) {
                if (pattern instanceof Array) {
                    // expression is list of choices
                    return pattern.indexOf(key) > -1;
                } else if (dessert.validators.isString(pattern)) {
                    // expression is string, must match by value
                    return pattern === key;
                } else if (pattern instanceof Object) {
                    // expression is wildcard object
                    return pattern === this.PATTERN_ASTERISK;
                }
                return false;
            }
        })
        .addMethod(/** @lends sntls.Query */{
            /**
             * @name sntls.Query.create
             * @return {sntls.Query}
             */

            /**
             * @param {Array|string} query
             */
            init: function (query) {
                var asArray = dessert.validators.isString(query) ?
                    this._parseString(query) :
                    query;

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
                    if (typeof key === 'string') {
                        result.push(key);
                    } else {
                        break;
                    }
                }

                return base.create(result);
            },

            /**
             * Determines whether query matches specified path
             * @param {sntls.Path} path
             * @return {boolean}
             */
            matchesPath: function (path) {
                var PATTERN_SKIP = this.PATTERN_SKIP,
                    queryAsArray = this.asArray,
                    pathAsArray = path.asArray,
                    i = 0, currentKey,
                    j = 0, currentPattern,
                    inSkipMode = false;

                while (i < pathAsArray.length && j < queryAsArray.length) {
                    currentKey = pathAsArray[i];
                    currentPattern = queryAsArray[j];

                    if (currentPattern === PATTERN_SKIP) {
                        // current pattern indicates skip mode 'on'
                        inSkipMode = true;
                        j++;
                    } else {
                        if (this._matchKeyToPattern(currentKey, currentPattern)) {
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
                       (i === pathAsArray.length || currentPattern === PATTERN_SKIP);
            },

            toString: function () {
                var asArray = this._encodeURI(this.asArray),
                    result = [],
                    i, key;

                for (i = 0; i < asArray.length; i++) {
                    key = asArray[i];
                    if (key instanceof Array) {
                        // optional keys
                        result.push(key.join('<'));
                    } else if (key instanceof Object) {
                        // wildcard key
                        result.push(key.symbol);
                    } else {
                        result.push(key);
                    }
                }

                return result.join('>');
            }
        });
});

(function () {
    "use strict";

    var Query = sntls.Query;

    dessert.addTypes(/** @lends dessert */{
        isQueryString: function (expr) {
            return this.isString(expr) &&
                   Query.RE_QUERY_VALIDATOR.test(expr);
        },

        isQuery: function (expr) {
            return Query.isBaseOf(expr);
        },

        isQueryOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   Query.isBaseOf(expr);
        }
    });

    /**
     * @return {sntls.Query}
     */
    String.prototype.toQuery = function () {
        return Query.create(this);
    };

    /**
     * @return {sntls.Query}
     */
    Array.prototype.toQuery = function () {
        return Query.create(this);
    };
}());
