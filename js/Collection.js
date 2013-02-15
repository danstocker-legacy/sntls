/**
 * General purpose collection for storing, counting, and performing
 * changes on named elements.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Collection', function (sntls) {
    var base = troop.Base,
        self;

    self = sntls.Collection = base.extend()
        .addPrivateConstant({
            // method names for general purpose constructors
            _ARRAY_METHOD_NAMES   : ["toString", "toLocaleString", "join", "pop", "push", "concat", "reverse", "shift",
                "unshift", "slice", "splice", "sort", "filter", "forEach", "some", "every", "map", "indexOf",
                "lastIndexOf", "reduce", "reduceRight"],
            _BOOLEAN_METHOD_NAMES : ["toString", "valueOf"],
            _DATE_METHOD_NAMES    : ["toString", "toDateString", "toTimeString", "toLocaleString", "toLocaleDateString",
                "toLocaleTimeString", "valueOf", "getTime", "getFullYear", "getUTCFullYear", "getMonth", "getUTCMonth",
                "getDate", "getUTCDate", "getDay", "getUTCDay", "getHours", "getUTCHours", "getMinutes",
                "getUTCMinutes", "getSeconds", "getUTCSeconds", "getMilliseconds", "getUTCMilliseconds",
                "getTimezoneOffset", "setTime", "setMilliseconds", "setUTCMilliseconds", "setSeconds", "setUTCSeconds",
                "setMinutes", "setUTCMinutes", "setHours", "setUTCHours", "setDate", "setUTCDate", "setMonth",
                "setUTCMonth", "setFullYear", "setUTCFullYear", "toGMTString", "toUTCString", "getYear", "setYear",
                "toISOString", "toJSON"],
            _FUNCTION_METHOD_NAMES: ["bind", "toString", "call", "apply"],
            _NUMBER_METHOD_NAMES  : ["toString", "toLocaleString", "valueOf", "toFixed", "toExponential", "toPrecision"
            ],
            _REGEXP_METHOD_NAMES  : ["exec", "test", "toString", "compile"],
            _STRING_METHOD_NAMES  : ["valueOf", "toString", "charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf",
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
                        itemName, item,
                        result = {};

                    // traversing collection items
                    for (itemName in items) {
                        if (items.hasOwnProperty(itemName)) {
                            item = items[itemName];

                            // delegating method call to item and adding
                            result[itemName] = item[methodName].apply(item, arguments);
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
             * @param itemName {string} Item name.
             * @returns {*} Item variable.
             */
            getItem: function (itemName) {
                return this.items[itemName];
            },

            /**
             * Sets an item in the collection.
             * @param itemName {string} Item name.
             * @param item Item variable / object.
             */
            setItem: function (itemName, item) {
                var isNew = !this.items.hasOwnProperty(itemName);

                // setting item
                this.items[itemName] = item;

                // increasing count when new item was added
                if (isNew) {
                    this.count++;
                }

                return this;
            },

            /**
             * Deletes item from collection.
             * @param itemName {string} Item name.
             */
            deleteItem: function (itemName) {
                if (this.items.hasOwnProperty(itemName)) {
                    // removing item
                    delete this.items[itemName];

                    // decreasing count
                    this.count--;
                }

                return this;
            },

            /**
             * Clones collection
             * @return {Collection} New collection with same contents as this.
             */
            clone: function () {
                var result = this.getBase().create();

                /**
                 * Copying items and count
                 * Other properties added by descendants
                 * must be cloned in override methods
                 */
                result.items = sntls.utils.shallowCopy(this.items);
                result.count = this.count;

                return result;
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
                    result, key,
                    fromItems, toItems;

                dessert.assert(collection.isA(base));

                result = this.clone();
                fromItems = collection.items;
                toItems = result.items;

                /**
                 * `collection.forEach` is not used because
                 * a) implicit conversion of primitive values to objects
                 * b) iteration is faster
                 */
                for (key in fromItems) {
                    if (fromItems.hasOwnProperty(key)) {
                        toItems[key] = fromItems[key];
                    }
                }

                // matching counts
                result.count += collection.count;

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
                    itemName;

                // handling simplified prefix filtering
                if (typeof re === 'string') {
                    re = new RegExp(re + '\\w*');
                }

                dessert.isRegExpOptional(re);

                if (re instanceof RegExp) {
                    for (itemName in this.items) {
                        if (this.items.hasOwnProperty(itemName) &&
                            re.test(itemName)
                            ) {
                            result.push(itemName);
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
                    itemName;

                for (itemName in this.items) {
                    if (this.items.hasOwnProperty(itemName)) {
                        result.push(this.items[itemName]);
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
                    keys = Object.keys(items),
                    i, itemName, item;

                for (i = 0; i < keys.length; i++) {
                    itemName = keys[i];
                    item = items[itemName];
                    if (handler.apply(item, [itemName].concat(args)) === false) {
                        break;
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
                    i, itemName, item;

                for (i = 0; i < keys.length; i++) {
                    itemName = keys[i];
                    item = items[itemName];
                    if (handler.apply(item, [itemName].concat(args)) === false) {
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
                    keys = Object.keys(items),
                    result = {},
                    i, itemName, item, method;

                for (i = 0; i < keys.length; i++) {
                    itemName = keys[i];
                    item = items[itemName];
                    method = item[methodName];
                    if (typeof method === 'function') {
                        result[itemName] = method.apply(item, args);
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
                    return self._ARRAY_METHOD_NAMES;
                case Boolean.prototype:
                    return self._BOOLEAN_METHOD_NAMES;
                case Date.prototype:
                    return self._DATE_METHOD_NAMES;
                case Function.prototype:
                    return self._FUNCTION_METHOD_NAMES;
                case Number.prototype:
                    return self._NUMBER_METHOD_NAMES;
                case RegExp.prototype:
                    return self._REGEXP_METHOD_NAMES;
                case String.prototype:
                    return self._STRING_METHOD_NAMES;
                default:
                    return Object.getOwnPropertyNames(obj);
                }
            }
        });
    }
});

/*global sntls */
dessert.addTypes({
    isCollection: function (expr) {
        return sntls.Collection.isPrototypeOf(expr);
    },

    isCollectionOptional: function (expr) {
        return typeof expr === 'undefined' ||
               sntls.Collection.isPrototypeOf(expr);
    }
});
