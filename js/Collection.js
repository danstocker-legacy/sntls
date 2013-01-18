/**
 * General purpose collection for storing, counting, and performing
 * changes on named elements.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Collection', function () {
    var base = troop.Base,
        self;

    self = sntls.Collection = base.extend()
        .addMethod({
            //////////////////////////////
            // OOP

            /**
             * Creates "specified collection".
             * Adds shortcut methods to items. It is assumed that the collection will only contain
             * elements of the specified type (ie bearing methods by the specified names).
             * @param methodNames {string[]|object} Array of method names, or object with method name keys.
             * @override
             */
            of: function (methodNames) {
                // in case methodNames is a fat constructor
                if (typeof methodNames === 'function') {
                    methodNames = methodNames.prototype;
                }

                if (dessert.validators.isPlainObject(methodNames)) {
                    // obtaining property names when methodNames is not array
                    methodNames = Object.getOwnPropertyNames(methodNames);
                } else {
                    dessert.isArray(methodNames);
                }

                // must work on classes derived from Collection, too
                var specified = troop.Base.extend.call(this),
                    shortcuts = {},
                    i, methodName;

                // adding shortcut methods to temp shortcuts object
                for (i = 0; i < methodNames.length; i++) {
                    methodName = methodNames[i];
                    shortcuts[methodName] = self._genShortcut(methodName);
                }

                // adding shortcut methods to extended class
                specified.addMethod(shortcuts);

                return specified;
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

    return self;
});
