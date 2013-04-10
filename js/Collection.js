/**
 * General purpose collection for storing, counting, and performing
 * changes on named elements.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Collection', function () {
    var hOP = Object.prototype.hasOwnProperty,
        self;

    /**
     * @class sntls.Collection
     * @extends troop.Base
     */
    sntls.Collection = self = troop.Base.extend()
        .addPrivateConstant(/** @lends sntls.Collection */{
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
        .addPrivateMethod(/** @lends sntls.Collection */{
            /**
             * Generates a shortcut method to be applied to the collection.
             * Shortcut methods traverse the collection and call the
             * invoked method on all items, collecting the return values
             * and returning them as a collection.
             * @param {string} methodName Name of method to make shortcut for.
             * @return {function}
             */
            _genShortcut: function (methodName) {
                dessert.isString(methodName, "Invalid method name");

                /**
                 * @this {sntls.Collection} Collection instance.
                 */
                return function () {
                    var items = this.items,
                        itemNames = Object.keys(items),
                        i, itemName, item,
                        result = {};

                    // traversing collection items
                    for (i = 0; i < itemNames.length; i++) {
                        itemName = itemNames[i];
                        item = items[itemName];

                        // delegating method call to item and adding
                        result[itemName] = item[methodName].apply(item, arguments);
                    }

                    return self.create(result);
                };
            },

            /**
             * Retrieves property names from object and returns an array for those that are functions.
             * @param {object} obj
             * @return {string[]}
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
        .addMethod(/** @lends sntls.Collection */{
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
             * @param {string[]|object|troop.Base} template Array of method names, or object with method name keys.
             * @return {sntls.Collection}
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
                    dessert.isArray(template, "Invalid collection template");
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
             * @param {object} [items] Initial contents.
             */
            init: function (items) {
                dessert.isObjectOptional(items, "Invalid items");

                // adding basic properties
                this.addPublic(/** @lends sntls.Collection */{
                    items: items || {},
                    count: items ? Object.keys(items).length : 0
                });
            },

            //////////////////////////////
            // Basic functions

            /**
             * Retrieves item from the collection.
             * @param {string} itemName Item name.
             * @returns {*} Item variable.
             */
            getItem: function (itemName) {
                return this.items[itemName];
            },

            /**
             * Sets an item in the collection.
             * @param {string} itemName Item name.
             * @param item Item variable / object.
             * @return {sntls.Collection}
             */
            setItem: function (itemName, item) {
                var isNew = !hOP.call(this.items, itemName);

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
             * @param {string} itemName Item name.
             * @return {sntls.Collection}
             */
            deleteItem: function (itemName) {
                if (hOP.call(this.items, itemName)) {
                    // removing item
                    delete this.items[itemName];

                    // decreasing count
                    this.count--;
                }

                return this;
            },

            /**
             * Clones collection
             * @return {sntls.Collection} New collection with same contents as this.
             */
            clone: function () {
                var result = /** @type sntls.Collection */ this.getBase().create();

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
             * Creates a collection of specified type initialized with
             * the contents of the current collection.
             * WARNING: shares item buffer with old collection,
             * therefore changes in one will be reflected in the other.
             * @param {sntls.Collection} returnType Collection class
             * @return {sntls.Collection}
             */
            asType: function (returnType) {
                dessert.isCollection(returnType);

                var result = /** @type sntls.Collection */ returnType.create();

                result.items = this.items;
                result.count = this.count;

                return result;
            },

            /**
             * Merges collection with current collection.
             * Conflicts are resolved through the optionally supplied callback, or by default,
             * the value from the current collection will be used.
             * @param {sntls.Collection} collection Collection to be merged to current. Must share
             * a common base with the current collection.
             * @param {function} [conflictResolver] Callback for resolving merge conflicts.
             * Callback receives as arguments: current collection, remote collection, and key of
             * the conflicting item.
             * @return {sntls.Collection} New collection with items from both collections in it.
             * Return type will be that of the current collection.
             */
            mergeWith: function (collection, conflictResolver) {
                dessert
                    .isCollection(collection, "Invalid collection")
                    .isFunctionOptional(conflictResolver, "Invalid conflict resolver callback");

                var base = this.getBase();

                dessert.assert(collection.isA(base), "Collection types do not match");

                var result = this.clone(),
                    fromItems = collection.items,
                    itemNames = Object.keys(fromItems),
                    toItems = result.items,
                    i, itemName;

                /**
                 * `collection.forEach` is not used because
                 * a) implicit conversion of primitive values to objects
                 * b) iteration is faster
                 */
                for (i = 0; i < itemNames.length; i++) {
                    itemName = itemNames[i];
                    if (!toItems.hasOwnProperty(itemName)) {
                        toItems[itemName] = fromItems[itemName];
                        result.count++;
                    } else if (conflictResolver) {
                        // resolving conflict with supplied function
                        toItems[itemName] = conflictResolver(this, collection, itemName);
                    }
                }

                return result;
            },

            //////////////////////////////
            // Filtering

            /**
             * Retrieves item names filtered by a regexp.
             * @param {RegExp|string} [re] Item name filter.
             * @return {string[]} Array of item names matching the regexp.
             */
            keys: function (re) {
                var result = [],
                    items, itemNames,
                    i, itemName;

                // handling simplified prefix filtering
                if (typeof re === 'string') {
                    re = new RegExp(re + '\\w*');
                }

                dessert.isRegExpOptional(re, "Invalid key filter");

                items = this.items;
                itemNames = Object.keys(items);

                if (re instanceof RegExp) {
                    for (i = 0; i < itemNames.length; i++) {
                        itemName = itemNames[i];
                        if (re.test(itemName)) {
                            result.push(itemName);
                        }
                    }
                    return result;
                } else {
                    return itemNames;
                }
            },

            /**
             * Filters collection elements.
             * @param {RegExp|string|function} selector Selector expression
             * @return {sntls.Collection} Filtered collection
             */
            filter: function (selector) {
                var result = {},
                    items = this.items,
                    itemNames,
                    i, itemName;

                if (selector instanceof RegExp ||
                    typeof selector === 'string'
                    ) {
                    itemNames = this.keys(selector);
                    for (i = 0; i < itemNames.length; i++) {
                        itemName = itemNames[i];
                        result[itemName] = items[itemName];
                    }
                } else if (typeof selector === 'function') {
                    itemNames = Object.keys(items);
                    for (i = 0; i < itemNames.length; i++) {
                        itemName = itemNames[i];
                        if (selector.call(items[itemName], itemName)) {
                            result[itemName] = items[itemName];
                        }
                    }
                } else {
                    dessert.assert(false, "Invalid filter selector");
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
                var keys = Object.keys(this.items),
                    result = [],
                    i;

                for (i = 0; i < keys.length; i++) {
                    result.push(this.items[keys[i]]);
                }

                return result;
            },

            /**
             * Retrieves collection items as array
             * in order of their names.
             * @param {function} [comparator] Comparator callback.
             * @returns {*[]} Item values in order of names.
             */
            asSortedArray: function (comparator) {
                dessert.isFunctionOptional(comparator, "Invalid comparator function");

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
             * @return {sntls.Collection}
             */
            clear: function () {
                // removing items
                this.items = {};
                this.count = 0;
                return this;
            },

            /**
             * Calls a function on each item.
             * @param {function} handler Function to call on each item.
             * Handler receives the current item as this, and the item name as
             * first argument. Forwards all other arguments to handler.
             * Iteration breaks when handler returns false.
             * @return {sntls.Collection}
             */
            forEach: function (handler) {
                dessert.isFunction(handler, "Invalid callback function");

                var args = Array.prototype.slice.call(arguments, 1),
                    items = this.items,
                    keys = Object.keys(items),
                    i, itemName, item;

                for (i = 0; i < keys.length; i++) {
                    itemName = keys[i];
                    item = items[itemName];
                    if (handler.apply(this, [item, itemName].concat(args)) === false) {
                        break;
                    }
                }

                return this;
            },

            /**
             * Calls function on each item in order of keys.
             * @param {function} handler Function to call on each item.
             * Handler receives the current item as this, and the item name as
             * first argument. Forwards all other arguments to handler.
             * Iteration breaks when handler returns false.
             * @return {sntls.Collection}
             */
            forNext: function (handler) {
                dessert.isFunction(handler, "Invalid callback function");

                var args = Array.prototype.slice.call(arguments, 1),
                    items = this.items,
                    keys = Object.keys(items).sort(),
                    i, itemName, item;

                for (i = 0; i < keys.length; i++) {
                    itemName = keys[i];
                    item = items[itemName];
                    if (handler.apply(this, [item, itemName].concat(args)) === false) {
                        break;
                    }
                }

                return this;
            },

            /**
             * Maps the collection's contents to a new collection.
             * @param {function} handler Transform function. Called on each element,
             * its return value will be placed in the mapped collection.
             * @param {sntls.Collection} [returnType] Reference to derived collection class.
             * When specified, the resulting collection will be an instance of this class.
             * @return {sntls.Collection}
             */
            map: function (handler, returnType) {
                dessert
                    .isFunction(handler, "Invalid callback function")
                    .isCollectionOptional(returnType);

                var items = this.items,
                    keys = Object.keys(items),
                    result = {},
                    i, itemName, item;

                for (i = 0; i < keys.length; i++) {
                    itemName = keys[i];
                    item = items[itemName];
                    result[itemName] = handler.call(this, item, itemName);
                }

                return (returnType || self).create(result);
            },

            /**
             * Calls a method on each item, identified by name.
             * Method results are collected and returned in a new collection.
             * @param {string} methodName Method name on each item.
             * @return {sntls.Collection}
             */
            callEach: function (methodName) {
                dessert.isString(methodName, "Invalid method name");

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
        self.addPrivateMethod(/** @lends sntls.Collection */{
            _getMethodNames: self._getES5MethodNames
        });
    } else {
        /**
         * For ES3 (JavaScript 1.5) we offer the method list for
         * a list of general purpose objects
         */
        self.addPrivateMethod(/** @lends sntls.Collection */{
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
dessert.addTypes(/** @lends dessert */{
    isCollection: function (expr) {
        return sntls.Collection.isPrototypeOf(expr);
    },

    isCollectionOptional: function (expr) {
        return typeof expr === 'undefined' ||
               sntls.Collection.isPrototypeOf(expr);
    }
});
