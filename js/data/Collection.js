/*global dessert, troop, sntls */
troop.postpone(sntls, 'Collection', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        slice = Array.prototype.slice,
        base = sntls.Hash,
        self = base.extend();

    /**
     * Instantiates class.
     * @name sntls.Collection.create
     * @function
     * @param {object|Array} [items] Initial contents.
     * @returns {sntls.Collection}
     */

    /**
     * Collection offers a way to manage multiple objects or primitives at once.
     * Ordinary collection operations such as content manipulation and filtering may be
     * performed on collections regardless of item types. So called "specified collections"
     * allow however to mix the item's API into the collection and treat collections of
     * objects as if they were a single instance of the same type.
     * @class sntls.Collection
     * @extends sntls.Hash
     */
    sntls.Collection = self
        .addPrivateMethods(/** @lends sntls.Collection */{
            /**
             * Generates a shortcut method to be applied to the collection.
             * Shortcut methods traverse the collection and call the
             * invoked method on all items, collecting the return values
             * and returning them as a collection.
             * @param {string} methodName Name of method to make shortcut for.
             * @returns {function}
             * @private
             * @memberOf sntls.Collection#
             */
            _genShortcut: function (methodName) {
                dessert.isString(methodName, "Invalid method name");

                /**
                 * @this {sntls.Collection} Collection instance.
                 */
                return function () {
                    var items = this.items,
                        result = items instanceof Array ? [] : {},
                        itemKeys = this.getKeys(),
                        i, itemKey, item,
                        itemResult,
                        isChainable = true;

                    // traversing collection items
                    for (i = 0; i < itemKeys.length; i++) {
                        itemKey = itemKeys[i];
                        item = items[itemKey];

                        // delegating method call to item and adding to result collection buffer
                        itemResult = item[methodName].apply(item, arguments);
                        result[itemKey] = itemResult;
                        isChainable = isChainable && itemResult === item;
                    }

                    // chainable collection method for chainable item methods
                    // otherwise returning results as plain collection
                    return isChainable ?
                        this :
                        self.create(result);
                };
            },

            /**
             * Retrieves property names from object and returns an array for those that are functions.
             * @param {object} obj
             * @returns {string[]}
             * @private
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
        .addMethods(/** @lends sntls.Collection# */{
            /**
             * Creates a specified collection that is modeled on a template object.
             * Specified collections inherit all methods from the template unless there's a conflict
             * in which case the original `Collection` method wins. Such conflicting methods not available
             * on the specified collection's API may be invoked indirectly through `.callOnEachItem()`.
             * Methods 'inherited' from the template call the corresponding function on each collection item
             * and return a generic collection with the results, except when *all* items return themselves,
             * in which case the original collection is returned. In other words, chainable methods of the
             * template remain chainable on the collection.
             * @example
             * var specified;
             * specified = sntls.Collection.of(Array);
             * specified = sntls.Collection.of(troop.Base);
             * specified = sntls.Collection.of(['foo', 'bar']);
             * specified = sntls.Collection.of({
             *  foo: function () {},
             *  bar: function () {}
             * });
             * sntls.Collection.of(String).create({
             *  foo: "hello",
             *  bar: "world"
             * }).split().items; // {foo: ['h', 'e', 'l', 'l', 'o'], bar: ['w', 'o', 'r', 'l', 'd']}
             * @param {string[]|object|troop.Base|function} template
             * Object containing method names either in the form of an array, or as indexes of an object.
             * From `Troop` classes only those methods will be considered that were added by the topmost extension.
             * Functions are treated as constructors, and `.of()` works with their `.prototype` the same way as
             * with any other object passed.
             * @returns {sntls.Collection}
             * @memberOf sntls.Collection
             */
            of: function (template) {
                // in case methodNames is a fat constructor
                if (typeof template === 'function') {
                    template = template.prototype;
                } else if (dessert.validators.isClass(template)) {
                    template = sntls.Utils.shallowCopy(template.getTarget());
                    delete template.init;
                }

                var methodNames;
                if (dessert.validators.isObject(template)) {
                    methodNames = this._getMethodNames(template);
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
                specifiedCollection.addMethods(shortcutMethods);

                return specifiedCollection;
            },

            //////////////////////////////
            // Basic functions

            /**
             * Retrieves item from the collection.
             * @param {string} itemKey Item key.
             * @returns {*} Item variable.
             */
            getItem: function (itemKey) {
                return this.items[itemKey];
            },

            /**
             * Sets an item in the collection. Overwrites item if there is already one by the same item key.
             * Increments counter for new items.
             * @example
             * var coll = sntls.Collection.create();
             * coll.set('foo', "bar");
             * coll.get('foo'); // "bar"
             * @param {string} itemKey Item key.
             * @param item Item variable / object.
             * @returns {sntls.Collection}
             */
            setItem: function (itemKey, item) {
                var isNew = !hOP.call(this.items, itemKey);

                // setting item
                this.items[itemKey] = item;

                // increasing count when new item was added
                if (isNew && typeof this.keyCount === 'number') {
                    this.keyCount++;
                }

                return this;
            },

            /**
             * Deletes item from collection. Decrements counter when an item was in fact deleted.
             * @param {string} itemKey Item key.
             * @returns {sntls.Collection}
             */
            deleteItem: function (itemKey) {
                if (hOP.call(this.items, itemKey)) {
                    // removing item
                    delete this.items[itemKey];

                    // decreasing count
                    if (typeof this.keyCount === 'number') {
                        this.keyCount--;
                    }
                }

                return this;
            },

            /**
             * Clones collection. Creates an instance of the same class (for subclasses of `Collection`)
             * and initializes it with a shallow copy of the current items buffer and item count.
             * @returns {sntls.Collection} New collection with identical contents.
             */
            clone: function () {
                var result = /** @type sntls.Collection */ this.getBase().create();

                /**
                 * Copying items and count
                 * Other properties added by descendants
                 * must be cloned in override methods
                 */
                result.items = sntls.Utils.shallowCopy(this.items);
                result.keyCount = this.keyCount;

                return result;
            },

            /**
             * Creates a new collection that is an instance of the specified collection subclass, and is initialized
             * with the current collection's contents BY REFERENCE. Disposing of the current instance is strongly
             * encouraged after calling this method.
             * @example
             * // converts a collection of strings to a string collection
             * var stringCollection = sntls.Collection.create(['hello', 'world'])
             *  .asType(sntls.Collection.of(String));
             * @param {sntls.Collection} subClass Subclass of `Collection`
             * @returns {sntls.Collection} Instance of the specified collection subclass, initialized with the
             * caller's item buffer and item count.
             */
            asType: function (subClass) {
                dessert.isCollection(subClass, "Type must be Collection-based");

                var result = /** @type sntls.Collection */ subClass.create();

                result.items = this.items;
                result.keyCount = this.keyCount;

                return result;
            },

            /**
             * Merges current collection with another collection. Adds all items from both collections
             * to a new collection instance. Item key conflicts are resolved by a suitable callback, or,
             * when there is none specified, the value from the current collection will be used.
             * @example
             * var merged = stringCollection
             *  .mergeWith(otherStringCollection, function (a, b, conflictingKey) {
             *      return b.getItem(conflictingKey);
             *  });
             * @param {sntls.Collection} collection Collection to be merged to current. Must share
             * a common base with the current collection.
             * @param {function} [conflictResolver] Callback for resolving merge conflicts.
             * Callback receives as arguments: current collection, remote collection, and key of
             * the conflicting item, and is expected to return a collection item.
             * @returns {sntls.Collection} New collection with items from both collections in it.
             * Return type will be that of the current collection.
             */
            mergeWith: function (collection, conflictResolver) {
                dessert
                    .isCollection(collection, "Invalid collection")
                    .isFunctionOptional(conflictResolver, "Invalid conflict resolver callback")
                    .assert(collection.isA(this.getBase()), "Collection types do not match");

                var result = this.clone(),
                    resultItems = result.items;

                collection.forEachItem(function (item, itemKey) {
                    if (!hOP.call(resultItems, itemKey)) {
                        result.setItem(itemKey, item);
                    } else if (conflictResolver) {
                        // resolving conflict with supplied function
                        result.setItem(itemKey, conflictResolver(this, collection, itemKey));
                    }
                });

                return result;
            },

            /**
             * Retrieves collection keys as an array. Also sets item counter when it is uninitialized.
             * @returns {string[]}
             */
            getKeys: function () {
                var result = Object.keys(this.items);
                if (typeof this.keyCount !== 'number') {
                    this.keyCount = result.length;
                }
                return result;
            },

            /**
             * Retrieves item keys as an array, filtered by a prefix. The in which keys appear in the resulting
             * array is not deterministic.
             * @example
             * var c = sntls.Collection.create({
             *  foo: 1,
             *  bar: 10,
             *  force: 100
             * });
             * c.getKeysByPrefix('fo'); // ['foo', 'force']
             * @param {string} prefix Item key prefix that keys must match in order to be included in the result.
             * @returns {string[]}
             */
            getKeysByPrefix: function (prefix) {
                dessert.isString(prefix, "Invalid prefix");

                var result = [],
                    itemKeys = this.getKeys(),
                    i, itemKey;

                for (i = 0; i < itemKeys.length; i++) {
                    itemKey = itemKeys[i];
                    if (itemKey.indexOf(prefix) === 0) {
                        // prefix matches item key
                        result.push(itemKey);
                    }
                }

                return result;
            },

            /**
             * Retrieves item keys as an array, filtered by a prefix, and wrapped in a hash.
             * @param {string} prefix
             * @returns {sntls.Hash}
             * @see sntls.Collection#getKeysByPrefix
             */
            getKeysByPrefixAsHash: function (prefix) {
                return sntls.Hash.create(this.getKeysByPrefix(prefix));
            },

            /**
             * Retrieves item keys as an array, filtered by a RegExp. The in which keys appear in the resulting
             * array is not deterministic.
             * @example
             * var c = sntls.Collection.create({
             *  foo: 1,
             *  bar: 10,
             *  force: 100
             * });
             * c.getKeysByRegExp(/^..r/); // ['bar', 'force']
             * @param {RegExp} regExp Regular expression that keys must match in order to be included in the result.
             * @returns {string[]}
             */
            getKeysByRegExp: function (regExp) {
                var result = [],
                    itemKeys = this.getKeys(),
                    i, itemKey;

                for (i = 0; i < itemKeys.length; i++) {
                    itemKey = itemKeys[i];
                    if (regExp.test(itemKey)) {
                        // filter matches item key
                        result.push(itemKey);
                    }
                }

                return result;
            },

            /**
             * Retrieves item keys as an array, filtered by a RegExp, and wrapped in a hash.
             * @param {RegExp} regExp
             * @returns {sntls.Hash}
             * @see sntls.Collection#getKeysByRegExp
             */
            getKeysByRegExpAsHash: function (regExp) {
                return sntls.Hash.create(this.getKeysByRegExp(regExp));
            },

            /**
             * Filters the collection by selecting only the items with the specified keys. Item keys that are not
             * present in the collection will be included in the results, too, as undefined.
             * @param {string[]} itemKeys Keys of items to be included in result.
             * @returns {sntls.Collection} New instance of the same collection subclass holding the filtered contents.
             */
            filterByKeys: function (itemKeys) {
                dessert.isArray(itemKeys, "Invalid item keys");

                var items = this.items,
                    resultItems = items instanceof Array ? [] : {},
                    i, itemKey;

                for (i = 0; i < itemKeys.length; i++) {
                    itemKey = itemKeys[i];
                    resultItems[itemKey] = items[itemKey];
                }

                return this.getBase().create(resultItems);
            },

            /**
             * Filters collection by matching keys against the specified prefix.
             * @param {string} prefix Item key prefix that keys must match in order to be included in the result.
             * @returns {sntls.Collection} New instance of the same collection subclass holding the filtered contents.
             */
            filterByPrefix: function (prefix) {
                return this.filterByKeys(this.getKeysByPrefix(prefix));
            },

            /**
             * Filters collection by matching keys against the specified regular expression.
             * @param {RegExp} regExp Regular expression that keys must match in order to be included in the result.
             * @returns {sntls.Collection} New instance of the same collection subclass holding the filtered contents.
             */
            filterByRegExp: function (regExp) {
                return this.filterByKeys(this.getKeysByRegExp(regExp));
            },

            /**
             * Filters collection applying the specified selector function to each item.
             * @example
             * // filters items with value higher than 50
             * c.filterBySelector(function (item, itemKey) {
             *  return item > 50;
             * }).items; // {force: 100}
             * @param {function} selector Selector function. Receives current item as first argument, and the key
             * of the current item as second argument. Expected to return a boolean: true when the item should be
             * included in the result, false if not. (In reality and truthy or falsy value will do.)
             * @param {object} [context=this] Optional selector context. Set to the collection instance by default.
             * @returns {sntls.Collection} New instance of the same collection subclass holding the filtered contents.
             */
            filterBySelector: function (selector, context) {
                dessert
                    .isFunction(selector, "Invalid selector")
                    .isObjectOptional(context, "Invalid context");

                var items = this.items,
                    resultItems = items instanceof Array ? [] : {},
                    itemKeys = this.getKeys(),
                    i, itemKey;

                for (i = 0; i < itemKeys.length; i++) {
                    itemKey = itemKeys[i];
                    if (selector.call(context || this, items[itemKey], itemKey)) {
                        resultItems[itemKey] = items[itemKey];
                    }
                }

                return this.getBase().create(resultItems);
            },

            /**
             * Retrieves collection items values in an array, without key information, ordered by item keys, or,
             * when a comparator function is specified, in the order defined by that.
             * @param {function} [comparator] Optional callback for comparing keys when sorting. The context (`this`)
             * will be set to the collection so item values may be compared too via `this.items`. Expected to return
             * an integer, the same way as in `Array.sort()`
             * @returns {Array} Item values in order of keys.
             * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
             */
            getSortedValues: function (comparator) {
                dessert.isFunctionOptional(comparator, "Invalid comparator function");

                var keys = this.getKeys().sort(comparator ? comparator.bind(this) : undefined),
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
             * @returns {sntls.Hash}
             * @see sntls.Collection#getSortedValues
             */
            getSortedValuesAsHash: function (comparator) {
                return sntls.Hash.create(this.getSortedValues(comparator));
            },

            /**
             * Clears collection by removing all items and re-setting item count to zero.
             * @returns {sntls.Collection}
             */
            clear: function () {
                // clearing items buffer
                base.clear.call(this);

                // resetting counter
                this.keyCount = 0;

                return this;
            },

            /**
             * Iterates over collection items and calls the specified handler function on each, until
             * either the iteration completes of handler returns `false`.
             * Iteration order is non-deterministic.
             * Iteration commences according to the initial state of the collection, with regards to
             * item keys and count. Therefore any handler function changing the collection will not thwart the
             * iteration process. However, changing the collection while iterating is strongly discouraged.
             * @example
             * c.forEachItem(function (item, itemKey, extraParam) {
             *  alert(itemKey + item + extraParam);
             * }, 'foo'); // outputs: 'foo1foo', 'bar10foo', 'force100foo'
             * @param {function} handler Function to be called on each item. The handler receives current item
             * as first argument, item key as second argument, and all other arguments passed to `.forEachItem()`
             * as the rest of its arguments.
             * @param {object} [context=this] Optional handler context. Set to the collection instance by default.
             * @returns {sntls.Collection}
             */
            forEachItem: function (handler, context) {
                dessert
                    .isFunction(handler, "Invalid callback function")
                    .isObjectOptional(context, "Invalid context");

                var items = this.items,
                    keys = this.getKeys(),
                    i, itemKey, item;

                for (i = 0; i < keys.length; i++) {
                    itemKey = keys[i];
                    item = items[itemKey];
                    if (handler.call(context || this, item, itemKey) === false) {
                        break;
                    }
                }

                return this;
            },

            /**
             * Iterates over collection items and calls the specified handler function on each in the order of keys.
             * Other than that, the method behaves the same way as `.forEach()`.
             * @param {function} handler @see sntls.Collection#forEachItem
             * Iteration breaks when handler returns false.
             * @param {object} [context=this] Optional selector context. Set to the collection instance by default.
             * @param {function} [comparator] Optional callback for comparing keys when sorting. The context (`this`)
             * will be set to the collection so item values may be compared too via `this.items`. Expected to return
             * an integer, the same way as in `Array.sort()`
             * @returns {sntls.Collection}
             * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
             */
            forEachItemSorted: function (handler, context, comparator) {
                dessert
                    .isFunction(handler, "Invalid callback function")
                    .isObjectOptional(context, "Invalid context")
                    .isFunctionOptional(comparator, "Invalid comparator function");

                var items = this.items,
                    keys = this.getKeys().sort(comparator ? comparator.bind(this) : undefined),
                    i, itemKey, item;

                for (i = 0; i < keys.length; i++) {
                    itemKey = keys[i];
                    item = items[itemKey];
                    if (handler.call(context || this, item, itemKey) === false) {
                        break;
                    }
                }

                return this;
            },

            /**
             * Maps collection, changing the keys but keeping the values.
             * @param {function} mapper Mapper function. Takes `item` and `itemKey` as arguments, and is expected
             * to return the mapped item key for the new collection.
             * @param {object} [context=this] Optional handler context. Set to the collection instance by default.
             * @param {function} [conflictResolver] Optional callback that resolves key conflicts.
             * Takes conflicting values and the mapped key associated with them.
             * @param {sntls.Collection} [subClass] Optional collection subclass for the output.
             * @return {sntls.Collection}
             */
            mapKeys: function (mapper, context, conflictResolver, subClass) {
                dessert
                    .isFunction(mapper, "Invalid mapper function")
                    .isObjectOptional(context, "Invalid context")
                    .isFunctionOptional(conflictResolver, "Invalid conflict resolver function")
                    .isCollectionOptional(subClass, "Invalid collection subclass");

                var items = this.items,
                    keys = this.getKeys(),
                    resultItems = items instanceof Array ? [] : {},
                    i, itemKey, mappedKey, item;

                for (i = 0; i < keys.length; i++) {
                    itemKey = keys[i];
                    item = items[itemKey];
                    mappedKey = mapper.call(context || this, item, itemKey);
                    if (hOP.call(resultItems, mappedKey) && conflictResolver) {
                        // when there's a key conflict and resolver is specified
                        item = conflictResolver.call(this, resultItems[mappedKey], item, mappedKey);
                    }
                    resultItems[mappedKey] = item;
                }

                return (subClass || self).create(resultItems);
            },

            /**
             * Maps collection, changing the values but keeping the keys.
             * @example
             * c.mapValues(function (item) {
             *  return 'hello' + item;
             * }, sntls.Collection.of(String));
             * @param {function} mapper Mapper function. Takes `item` and `itemKey` as arguments, and is expected
             * to return the mapped item value for the new collection.
             * @param {object} [context=this] Optional handler context. Set to the collection instance by default.
             * @param {sntls.Collection} [subClass] Optional collection subclass for the output.
             * @returns {sntls.Collection} New collection instance (of the specified type) containing mapped items.
             */
            mapValues: function (mapper, context, subClass) {
                dessert
                    .isFunction(mapper, "Invalid mapper function")
                    .isObjectOptional(context, "Invalid context")
                    .isCollectionOptional(subClass, "Invalid collection subclass");

                var items = this.items,
                    keys = this.getKeys(),
                    resultItems = items instanceof Array ? [] : {},
                    i, itemKey, item;

                for (i = 0; i < keys.length; i++) {
                    itemKey = keys[i];
                    item = items[itemKey];
                    resultItems[itemKey] = mapper.call(context || this, item, itemKey);
                }

                return (subClass || self).create(resultItems);
            },

            /**
             * Collects property from each item and packs them into a collection.
             * Equivalent to mapping the collection using a property getter, but
             * saves a function call on each item.
             * @param {string} propertyName Name of property to retrieve from each item.
             * @param {sntls.Collection} [subClass] Optional collection subclass for the output.
             * @returns {sntls.Collection}
             */
            collectProperty: function (propertyName, subClass) {
                dessert.isCollectionOptional(subClass, "Invalid collection subclass");

                var items = this.items,
                    keys = this.getKeys(),
                    resultItems = items instanceof Array ? [] : {},
                    i, itemKey;

                for (i = 0; i < keys.length; i++) {
                    itemKey = keys[i];
                    resultItems[itemKey] = items[itemKey][propertyName];
                }

                return (subClass || self).create(resultItems);
            },

            /**
             * Passes each item to the specified handler as argument, and returns the results packed in a
             * plain collection instance. Similar to `.mapValues`
             * @example
             * var c = sntls.Collection.create(['foo', 'bar']);
             * function splitIntoLetters(delim, str) {
             *  return str.split(delim);
             * }
             * c.passEachItemTo(splitIntoLetters, null, 1, '').items; // [['f', 'o', 'o'], ['b', 'a', 'r']]
             * @param {function} handler Any function.
             * @param {*} [context=this] Context in which to call the handler. If handler is a method, the context
             * should be the owner (instance or class) of the method. Set to the collection instance by default.
             * @param {number} [argIndex] Argument index at which collection items will be expected.
             * @returns {sntls.Collection}
             */
            passEachItemTo: function (handler, context, argIndex) {
                var args = slice.call(arguments, 3),
                    items = this.items,
                    keys = this.getKeys(),
                    resultItems = items instanceof Array ? [] : {},
                    i, itemKey;

                if (args.length) {
                    // there are additional arguments specified
                    // splicing in placeholder for collection item
                    args.splice(argIndex, 0, null);
                    for (i = 0; i < keys.length; i++) {
                        itemKey = keys[i];
                        args[argIndex] = items[itemKey];
                        resultItems[itemKey] = handler.apply(context || this, args);
                    }
                } else {
                    // no additional arguments
                    // passing items as first argument
                    for (i = 0; i < keys.length; i++) {
                        itemKey = keys[i];
                        resultItems[itemKey] = handler.call(context || this, items[itemKey]);
                    }
                }

                // returning results as plain collection
                return self.create(resultItems);
            },

            /**
             * Calls the specified method on each item (assuming they're objects and have a method by the given name),
             * and gathers their results in a collection. When the specified method was chainable on *all* items,
             * a reference to the original collection is returned, similarly to methods auto-generated by `.of()`.
             * The rest of the arguments are forwarded to the method calls.
             * @example
             * var c = sntls.Collection.create({
             *  foo: "bar",
             *  hello: "world"
             * });
             * c.callOnEachItem('split').items; // {foo: ['b', 'a', 'r'], hello: ['h', 'e', 'l', 'l', 'o']}
             * @param {string} methodName Name identifying method on items.
             * @returns {sntls.Collection}
             */
            callOnEachItem: function (methodName) {
                dessert.isString(methodName, "Invalid method name");

                var args = slice.call(arguments, 1),
                    items = this.items,
                    keys = this.getKeys(),
                    resultItems = items instanceof Array ? [] : {},
                    i, itemKey, item,
                    itemMethod, itemResult,
                    isChainable = true;

                for (i = 0; i < keys.length; i++) {
                    itemKey = keys[i];
                    item = items[itemKey];
                    itemMethod = item[methodName];
                    if (typeof itemMethod === 'function') {
                        itemResult = itemMethod.apply(item, args);
                        resultItems[itemKey] = itemResult;
                        isChainable = isChainable && itemResult === item;
                    }
                }

                // chainable collection method for chainable item methods
                // otherwise returning results as plain collection
                return isChainable ?
                    this :
                    self.create(resultItems);
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

    sntls.Hash.addMethods(/** @lends sntls.Hash# */{
        /**
         * Reinterprets hash as collection, optionally as the specified subclass.
         * @param {sntls.Collection} [subClass] Collection subclass.
         * @returns {sntls.Collection}
         */
        toCollection: function (subClass) {
            dessert.isCollectionOptional(subClass);

            if (subClass) {
                return subClass.create(this.items);
            } else {
                return sntls.Collection.create(this.items);
            }
        }
    });
}());
