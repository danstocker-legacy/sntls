/**
 * General purpose collection for storing, counting, and performing
 * changes on named elements.
 */
/*global dessert, troop */
troop.promise('sntls.Collection', function (sntls, className) {
    var base = troop.Base,
        self;

    self = sntls.Collection = base.extend()
        .addConstant({
            // method names for general purpose constructors
            ARRAY_METHOD_NAMES   : ["toString", "toLocaleString", "join", "pop", "push", "concat", "reverse", "shift",
                "unshift", "slice", "splice", "sort", "filter", "forEach", "some", "every", "map", "indexOf",
                "lastIndexOf", "reduce", "reduceRight"],
            BOOLEAN_METHOD_NAMES : ["toString", "valueOf"],
            DATE_METHOD_NAMES    : ["toString", "toDateString", "toTimeString", "toLocaleString", "toLocaleDateString",
                "toLocaleTimeString", "valueOf", "getTime", "getFullYear", "getUTCFullYear", "getMonth", "getUTCMonth",
                "getDate", "getUTCDate", "getDay", "getUTCDay", "getHours", "getUTCHours", "getMinutes",
                "getUTCMinutes", "getSeconds", "getUTCSeconds", "getMilliseconds", "getUTCMilliseconds",
                "getTimezoneOffset", "setTime", "setMilliseconds", "setUTCMilliseconds", "setSeconds", "setUTCSeconds",
                "setMinutes", "setUTCMinutes", "setHours", "setUTCHours", "setDate", "setUTCDate", "setMonth",
                "setUTCMonth", "setFullYear", "setUTCFullYear", "toGMTString", "toUTCString", "getYear", "setYear",
                "toISOString", "toJSON"],
            FUNCTION_METHOD_NAMES: ["bind", "toString", "call", "apply"],
            NUMBER_METHOD_NAMES  : ["toString", "toLocaleString", "valueOf", "toFixed", "toExponential", "toPrecision"],
            REGEXP_METHOD_NAMES  : ["exec", "test", "toString", "compile"],
            STRING_METHOD_NAMES  : ["valueOf", "toString", "charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf",
                "localeCompare", "match", "replace", "search", "slice", "split", "substring", "substr", "toLowerCase",
                "toLocaleLowerCase", "toUpperCase", "toLocaleUpperCase", "trim", "trimLeft", "trimRight", "link",
                "anchor", "fontcolor", "fontsize", "big", "blink", "bold", "fixed", "italics", "small", "strike", "sub",
                "sup"]
        })
        .addMethod({
            //////////////////////////////
            // OOP

            /**
             * Creates "specified collection".
             * Adds shortcut methods to items. It is assumed that the collection will only contain
             * elements of the specified type (ie bearing methods by the specified names).
             *
             * WARNING: A specified collection may overshadow original collection methods, so
             * if the specifying class is known to have conflicts, it is better to call
             * original Collection methods like this: `sntls.Collection.filter.call(yourCollection, expr)`
             *
             * @param template {string[]|object|troop.Base} Array of method names, or object with method name keys.
             * @override
             */
            of: function (template) {
                // in case methodNames is a fat constructor
                if (typeof template === 'function') {
                    template = template.prototype;
                } else if (dessert.validators.isClass(template)) {
                    template = sntls.utils.shallowCopy(template.getTarget());
                    delete template.init;
                }

                var methodNames;
                if (dessert.validators.isObject(template)) {
                    methodNames = self._getMethodNames(template);
                } else {
                    dessert.isArray(template);
                    methodNames = template;
                }

                // must work on classes derived from Collection, too
                var specifiedCollection = troop.Base.extend.call(this),
                    shortcutMethods = {},
                    i, methodName;

                // adding shortcut methods to temp shortcuts object
                for (i = 0; i < methodNames.length; i++) {
                    methodName = methodNames[i];
                    shortcutMethods[methodName] = self._genShortcut(methodName);
                }

                // adding shortcut methods to extended class
                specifiedCollection.addMethod(shortcutMethods);

                return specifiedCollection;
            },

            /**
             * @constructor
             * @param [items] {object} Initial contents.
             */
            init: function (items) {
                dessert.isObjectOptional(items);

                // adding basic properties
                this.addPublic({
                    items: items || {},
                    count: items ? Object.keys(items).length : 0
                });
            }
        })
        .addPrivateMethod({
            /**
             * Generates a shortcut method to be applied to the collection.
             * Shortcut methods traverse the collection and call the
             * invoked method on all items, collecting the return values
             * and returning them as a collection.
             * @param methodName {string} Name of method to make shortcut for.
             * @private
             */
            _genShortcut: function (methodName) {
                dessert.isString(methodName);

                /**
                 * @this {sntls.Collection} Collection instance.
                 */
                return function () {
                    var items = this.items,
                        name, item,
                        result = {};

                    // traversing collection items
                    for (name in items) {
                        if (items.hasOwnProperty(name)) {
                            item = items[name];

                            // delegating method call to item and adding
                            result[name] = item[methodName].apply(item, arguments);
                        }
                    }

                    return self.create(result);
                };
            },

            /**
             * Retrieves property names from object and returns an array for those that are functions.
             * @param obj {object}
             * @return {string[]}
             * @private
             */
            _getES5MethodNames: function (obj) {
                var propertyNames = Object.getOwnPropertyNames(obj),
                    methodNames = [],
                    i, propertyName;
                for (i = 0; i < propertyNames.length; i++) {
                    propertyName = propertyNames[i];
                    if (typeof obj[propertyName] === 'function') {
                        methodNames.push(propertyName);
                    }
                }
                return methodNames;
            }
        })
        .addMethod({
            //////////////////////////////
            // Basics

            /**
             * Retrieves item from the collection.
             * @param name {string} Item name.
             * @returns {*} Item variable.
             */
            get: function (name) {
                return this.items[name];
            },

            /**
             * Sets an item in the collection.
             * @param name {string} Item name.
             * @param item Item variable / object.
             */
            set: function (name, item) {
                var isNew = !this.items.hasOwnProperty(name);

                // setting item
                this.items[name] = item;

                // increasing count when new item was added
                if (isNew) {
                    this.count++;
                }

                return this;
            },

            /**
             * Removes item from collection.
             * @param name {string} Item name.
             */
            unset: function (name) {
                if (this.items.hasOwnProperty(name)) {
                    // removing item
                    delete this.items[name];

                    // decreasing count
                    this.count--;
                }

                return this;
            },

            /**
             * Merges collection to current collection
             * @param collection {Collection} Collection to be merged to current
             * @return {Collection} New collection with items from both collections in it.
             * When current collection is specified collection,
             */
            merge: function (collection) {
                dessert.isCollection(collection);

                var base = this.getBase(),
                    result = base.create(sntls.utils.shallowCopy(this.items));

                collection.forEach(function (name) {
                    result.set(name, this);
                });

                return result;
            },

            //////////////////////////////
            // Filtering

            /**
             * Retrieves item names filtered by a regexp.
             * @param [re] {RegExp|string} Item name filter.
             * @return {string[]} Array of item names matching the regexp.
             */
            keys: function (re) {
                var result = [],
                    name;

                // handling simplified prefix filtering
                if (typeof re === 'string') {
                    re = new RegExp(re + '\\w*');
                }

                dessert.isRegExpOptional(re);

                if (re instanceof RegExp) {
                    for (name in this.items) {
                        if (this.items.hasOwnProperty(name) &&
                            re.test(name)
                            ) {
                            result.push(name);
                        }
                    }
                    return result;
                } else {
                    return Object.keys(this.items);
                }
            },

            /**
             * Filters collection elements.
             * @param selector {RegExp|string|function} Selector expression
             * @return {sntls.Collection} Filtered collection
             */
            filter: function (selector) {
                var result = {},
                    items = this.items,
                    keys,
                    i, key;

                if (selector instanceof RegExp ||
                    typeof selector === 'string'
                    ) {
                    keys = this.keys(selector);
                    for (i = 0; i < keys.length; i++) {
                        key = keys[i];
                        result[key] = items[key];
                    }
                } else if (typeof selector === 'function') {
                    for (key in items) {
                        if (items.hasOwnProperty(key) &&
                            selector.call(items[key], key)
                            ) {
                            result[key] = items[key];
                        }
                    }
                } else {
                    dessert.assert(false, "Invalid argument `selector`.");
                }

                return this.getBase().create(result);
            },

            //////////////////////////////
            // Array representation

            /**
             * Retrieves collection items as array.
             * @returns {*[]} Item values.
             */
            asArray: function () {
                var result = [],
                    name;

                for (name in this.items) {
                    if (this.items.hasOwnProperty(name)) {
                        result.push(this.items[name]);
                    }
                }

                return result;
            },

            /**
             * Retrieves collection items as array
             * in order of their names.
             * @param comparator {function} Comparator callback.
             * @returns {*[]} Item values in order of names.
             */
            asSortedArray: function (comparator) {
                dessert.isFunctionOptional(comparator);

                var keys = Object.keys(this.items).sort(comparator),
                    result = [],
                    i;

                for (i = 0; i < keys.length; i++) {
                    result.push(this.items[keys[i]]);
                }

                return result;
            },

            //////////////////////////////
            // Content manipulation

            /**
             * Empties collection.
             */
            clear: function () {
                // removing items
                this.items = {};
                this.count = 0;
                return this;
            },

            /**
             * Calls a function on each item.
             * @param handler {function} Function to call on each item.
             * Handler receives the current item as this, and the item name as
             * first argument. Forwards all other arguments to handler.
             * Iteration breaks when handler returns false.
             */
            forEach: function (handler) {
                dessert.isFunction(handler);

                var args = Array.prototype.slice.call(arguments, 1),
                    items = this.items,
                    name, item;

                for (name in items) {
                    if (items.hasOwnProperty(name)) {
                        item = items[name];
                        if (handler.apply(item, [name].concat(args)) === false) {
                            break;
                        }
                    }
                }

                return this;
            },

            /**
             * Calls function on each item in order of keys.
             * @param handler {function} Function to call on each item.
             * Handler receives the current item as this, and the item name as
             * first argument. Forwards all other arguments to handler.
             * Iteration breaks when handler returns false.
             */
            forNext: function (handler) {
                dessert.isFunction(handler);

                var args = Array.prototype.slice.call(arguments, 1),
                    items = this.items,
                    keys = Object.keys(items).sort(),
                    i, name, item;

                for (i = 0; i < keys.length; i++) {
                    name = keys[i];
                    item = items[name];
                    if (handler.apply(item, [name].concat(args)) === false) {
                        break;
                    }
                }

                return this;
            },

            /**
             * Calls a method on each item, identified by name.
             * Method results are collected and returned in a new collection.
             * @param methodName {string} Method name on each item.
             * @return {sntls.Collection}
             */
            callEach: function (methodName) {
                dessert.isString(methodName);

                var args = Array.prototype.slice.call(arguments, 1),
                    items = this.items,
                    result = {},
                    name, item, method;

                for (name in items) {
                    if (items.hasOwnProperty(name)) {
                        item = items[name];
                        method = item[methodName];
                        if (typeof method === 'function') {
                            result[name] = method.apply(item, args);
                        }
                    }
                }

                return self.create(result);
            }
        });

    if (troop.Feature.hasPropertyAttributes()) {
        /**
         * For ES5, we go with ordinary method extraction
         */
        self.addPrivateMethod({
            _getMethodNames: self._getES5MethodNames
        });
    } else {
        /**
         * For ES3 (JavaScript 1.5) we offer the method list for
         * a list of general purpose objects
         */
        self.addPrivateMethod({
            _getMethodNames: function (obj) {
                switch (obj) {
                case Array.prototype:
                    return self.ARRAY_METHOD_NAMES;
                case Boolean.prototype:
                    return self.BOOLEAN_METHOD_NAMES;
                case Date.prototype:
                    return self.DATE_METHOD_NAMES;
                case Function.prototype:
                    return self.FUNCTION_METHOD_NAMES;
                case Number.prototype:
                    return self.NUMBER_METHOD_NAMES;
                case RegExp.prototype:
                    return self.REGEXP_METHOD_NAMES;
                case String.prototype:
                    return self.STRING_METHOD_NAMES;
                default:
                    return Object.getOwnPropertyNames(obj);
                }
            }
        });
    }

    dessert.addTypes({
        isCollection: function (expr) {
            return self.isPrototypeOf(expr);
        },

        isCollectionOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   self.isPrototypeOf(expr);
        }
    });
});
