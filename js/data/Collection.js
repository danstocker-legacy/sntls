/**
 * General purpose collection for storing, counting, and performing
 * changes on named elements.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Collection', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        base = sntls.Hash,
        self = base.extend();

    /**
     * @class sntls.Collection
     * @extends sntls.Hash
     */
    sntls.Collection = self
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
                        result = items instanceof Array ? [] : {},
                        itemNames = Object.keys(items),
                        i, itemName, item;

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
            _getMethodNames: function (obj) {
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
                var specifiedCollection = /** @type {sntls.Collection} */ troop.Base.extend.call(this),
                    shortcutMethods = {},
                    i, methodName;

                // adding shortcut methods to temp shortcuts object
                for (i = 0; i < methodNames.length; i++) {
                    methodName = methodNames[i];
                    // template method mustn't override original Collection properties
                    // those (shadowing) methods can still be invoked via .callOnEachItem()
                    if (typeof this[methodName] === 'undefined') {
                        shortcutMethods[methodName] = self._genShortcut(methodName);
                    }
                }

                // adding shortcut methods to extended class
                specifiedCollection.addMethod(shortcutMethods);

                return specifiedCollection;
            },

            /**
             * @name sntls.Collection.create
             * @return {sntls.Collection}
             */

            /**
             * @param {object} [items] Initial contents.
             */
            init: function (items) {
                base.init.apply(this, arguments);

                /**
                 * Number of items in collection
                 * @type {Number}
                 */
                this.count = items ? Object.keys(items).length : 0;
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
             * @return {sntls.Collection} New instance of the specified
             * (collection-based) type initialized w/ with same contents.
             */
            asType: function (returnType) {
                dessert.isCollection(returnType, "Type must be Collection-based");

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
                    .isFunctionOptional(conflictResolver, "Invalid conflict resolver callback")
                    .assert(collection.isA(this.getBase()), "Collection types do not match");

                var result = this.clone(),
                    resultItems = result.items;

                collection.forEachItem(function (item, itemName) {
                    if (!hOP.call(resultItems, itemName)) {
                        result.setItem(itemName, item);
                    } else if (conflictResolver) {
                        // resolving conflict with supplied function
                        result.setItem(itemName, conflictResolver(this, collection, itemName));
                    }
                });

                return result;
            },

            /**
             * Retrieves collection keys matching the specified prefix
             * @param {string} prefix
             * @return {string[]}
             */
            getKeysByPrefix: function (prefix) {
                dessert.isString(prefix, "Invalid prefix");

                var result = [],
                    itemNames = Object.keys(this.items),
                    i, itemName;

                for (i = 0; i < itemNames.length; i++) {
                    itemName = itemNames[i];
                    if (itemName.indexOf(prefix) === 0) {
                        // prefix matches item name
                        result.push(itemName);
                    }
                }

                return result;
            },

            /**
             * Retrieves collection keys matching the specified prefix, wrapped in a hash.
             * @param {string} prefix
             * @return {sntls.Hash}
             */
            getKeysByPrefixAsHash: function (prefix) {
                return sntls.Hash.create(this.getKeysByPrefix(prefix));
            },

            /**
             * Retrieves collection keys matching the specified regular expression.
             * @param {RegExp} regExp
             * @return {Array}
             */
            getKeysByRegExp: function (regExp) {
                var result = [],
                    itemNames = Object.keys(this.items),
                    i, itemName;

                for (i = 0; i < itemNames.length; i++) {
                    itemName = itemNames[i];
                    if (regExp.test(itemName)) {
                        // filter matches item name
                        result.push(itemName);
                    }
                }

                return result;
            },

            /**
             * Retrieves collection keys matching the specified regular expression, wrapped in a hash.
             * @param {RegExp} regExp
             * @return {sntls.Hash}
             */
            getKeysByRegExpAsHash: function (regExp) {
                return sntls.Hash.create(this.getKeysByRegExp(regExp));
            },

            /**
             * Selects specified collection items and returns them in a
             * new collection of the same type.
             * @param {string[]} itemNames Names of items to include in result
             * @return {sntls.Collection}
             */
            filterByKeys: function (itemNames) {
                dessert.isArray(itemNames, "Invalid item names");

                var items = this.items,
                    result = items instanceof Array ? [] : {},
                    i, itemName;

                for (i = 0; i < itemNames.length; i++) {
                    itemName = itemNames[i];
                    result[itemName] = items[itemName];
                }

                return this.getBase().create(result);
            },

            /**
             * Filters collection by key prefix.
             * @param {string} prefix
             * @return {sntls.Collection}
             */
            filterByPrefix: function (prefix) {
                return this.filterByKeys(this.getKeysByPrefix(prefix));
            },

            /**
             * Filters collection by matching keys to the specified regular expression.
             * @param {RegExp} regExp
             * @return {sntls.Collection}
             */
            filterByRegExp: function (regExp) {
                return this.filterByKeys(this.getKeysByRegExp(regExp));
            },

            /**
             * Filters collection by a selector function.
             * @param {function} selector Selector function. Receives `item` and `itemName`
             * as arguments, and the collection as `this`, and should return true when
             * item should be included in results.
             * @return {sntls.Collection}
             */
            filterBySelector: function (selector) {
                var items = this.items,
                    result = items instanceof Array ? [] : {},
                    itemNames = Object.keys(items),
                    i, itemName;

                for (i = 0; i < itemNames.length; i++) {
                    itemName = itemNames[i];
                    if (selector.call(this, items[itemName], itemName)) {
                        result[itemName] = items[itemName];
                    }
                }

                return this.getBase().create(result);
            },

            /**
             * Retrieves collection items as array in order of their names
             * or according to the supplied comparator.
             * @param {function} [comparator] Comparator for sorting keys.
             * @returns {*[]} Item values in order of names.
             */
            getSortedValues: function (comparator) {
                dessert.isFunctionOptional(comparator, "Invalid comparator function");

                var keys = Object.keys(this.items).sort(comparator ? comparator.bind(this) : undefined),
                    result = [],
                    i;

                for (i = 0; i < keys.length; i++) {
                    result.push(this.items[keys[i]]);
                }

                return result;
            },

            /**
             * Retrieves sorted item values array wrapped in a hash.
             * @param {function} [comparator] Comparator for sorting keys.
             * @return {sntls.Hash}
             * @see sntls.Collection.getSortedValues
             */
            getSortedValuesAsHash: function (comparator) {
                return sntls.Hash.create(this.getSortedValues(comparator));
            },

            /**
             * Empties collection.
             * @return {sntls.Collection}
             */
            clear: function () {
                // clearing items buffer
                base.clear.call(this);

                // resetting counter
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
            forEachItem: function (handler) {
                dessert.isFunction(handler, "Invalid callback function");

                var items = this.items,
                    keys = Object.keys(items),
                    i, itemName, item;

                for (i = 0; i < keys.length; i++) {
                    itemName = keys[i];
                    item = items[itemName];
                    if (handler.call(this, item, itemName) === false) {
                        break;
                    }
                }

                return this;
            },

            /**
             * Calls function on each item in a specific order.
             * @param {function} handler Function to call on each item.
             * Handler receives the current item as this, and the item name as
             * first argument. Forwards all other arguments to handler.
             * Iteration breaks when handler returns false.
             * @param {function} [comparator] Comparator for sorting keys.
             * Receives collection instance as context for accessing item values.
             * @return {sntls.Collection}
             */
            forEachItemSorted: function (handler, comparator) {
                dessert
                    .isFunction(handler, "Invalid callback function")
                    .isFunctionOptional(comparator, "Invalid comparator function");

                var items = this.items,
                    keys = Object.keys(items).sort(comparator ? comparator.bind(this) : undefined),
                    i, itemName, item;

                for (i = 0; i < keys.length; i++) {
                    itemName = keys[i];
                    item = items[itemName];
                    if (handler.call(this, item, itemName) === false) {
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
             * @return {sntls.Collection} New collection instance (of the specified type)
             * containing mapped items.
             */
            mapContents: function (handler, returnType) {
                dessert
                    .isFunction(handler, "Invalid callback function")
                    .isCollectionOptional(returnType);

                var items = this.items,
                    keys = Object.keys(items),
                    result = items instanceof Array ? [] : {},
                    i, itemName, item;

                for (i = 0; i < keys.length; i++) {
                    itemName = keys[i];
                    item = items[itemName];
                    result[itemName] = handler.call(this, item, itemName);
                }

                return (returnType || self).create(result);
            },

            /**
             * Invokes a method on each item, identified by name.
             * Method results are collected and returned in a new collection.
             * @param {string} methodName Method name on each item.
             * @return {sntls.Collection}
             */
            callOnEachItem: function (methodName) {
                dessert.isString(methodName, "Invalid method name");

                var args = Array.prototype.slice.call(arguments, 1),
                    items = this.items,
                    keys = Object.keys(items),
                    result = items instanceof Array ? [] : {},
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
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isCollection: function (expr) {
            return sntls.Collection.isPrototypeOf(expr);
        },

        isCollectionOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Collection.isPrototypeOf(expr);
        }
    });

    sntls.Hash.addMethod(/** @lends sntls.Hash */{
        /**
         * @param {sntls.Collection} [returnType]
         * @return {sntls.Collection}
         */
        toCollection: function (returnType) {
            dessert.isCollectionOptional(returnType);

            if (returnType) {
                return returnType.create(this.items);
            } else {
                return sntls.Collection.create(this.items);
            }
        }
    });
}());
