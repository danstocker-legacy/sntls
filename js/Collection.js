/**
 * General purpose collection for storing, counting, and performing
 * changes on named elements.
 */
/*global troop */
var sntls = sntls || {};

troop.promise(sntls, 'Collection', function () {
    var base = troop.Base,
        self;

    self = sntls.Collection = base.extend()
        .addMethod({
            //////////////////////////////
            // OOP

            /**
             * Overridden extend adds shortcut methods to items.
             * @param methodNames {string[]|object} Array of method names, or object with method name keys.
             * @override
             */
            extend: function (methodNames) {
                var extended = base.extend.call(self),
                    shortcuts = {},
                    i, methodName;

                if (!(methodNames instanceof Array) &&
                    typeof methodNames === 'object'
                    ) {
                    methodNames = Object.getOwnPropertyNames(methodNames);
                }

                for (i = 0; i < methodNames.length; i++) {
                    methodName = methodNames[i];
                    shortcuts[methodName] = self._genShortcut(methodName);
                }

                // adding shortcut methods to extended class
                extended.addMethod(shortcuts);

                return extended;
            },

            init: function (items) {
                // adding basic properties
                this.addPublic({
                    items: items || {},
                    count: items ? Object.keys(items).length : 0
                });
            }
        }).addPrivateMethod({
            /**
             * Generates a shortcut method to be applied to the collection.
             * Shortcut methods traverse the collection and call the
             * invoked method on all items, collecting the return values
             * and returning them as a collection.
             * @param methodName {string} Name of method to make shortcut for.
             * @private
             */
            _genShortcut: function (methodName) {
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

                    return self.create.call(self, result);
                };
            }
        }).addMethod({
            //////////////////////////////
            // Basics

            /**
             * Tells whether an item is in the collection.
             * @param name {string} Item name.
             * @returns {boolean}
             */
            has: function (name) {
                return this.items.hasOwnProperty(name);
            },

            /**
             * Retrieves item names filtered by a regexp.
             * @param [re] {RegExp} Item name filter.
             * @return {string[]} Array of item names matching the regexp.
             */
            keys: function (re) {
                var result = [],
                    name;

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
                    return Object.keys(this.item);
                }
            },

            /**
             * Retrieves item from the collection.
             * @param name {string} Item name.
             * @returns {*} Item variable.
             */
            get: function (name) {
                return this.items[name];
            },

            /**
             * Filters collection by a regular expression.
             * @param re {RegExp} Filter expression
             * @return {sntls.Collection} Filtered collection
             */
            filter: function (re) {
                var result = self.create(),
                    keys = this.keys(re),
                    i, key;
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    result.set(key, this.items[key]);
                }
                return result;
            },

            /**
             * Sets an item in the collection.
             * @param name {string} Item name.
             * @param item Item variable / object.
             */
            set: function (name, item) {
                var isAdd = !this.items.hasOwnProperty(name);

                // setting item
                this.items[name] = item;

                // increasing count when new item was added
                if (isAdd) {
                    this.count++;
                }

                return this;
            },

            /**
             * Removes item from wraith.LOOKUP.
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
             * @returns {*[]} Item values in order of names.
             */
            asSortedArray: function () {
                var keys = Object.keys(this.items).sort(),
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
            empty: function () {
                // removing items
                this.items = {};
                this.count = 0;
                return this;
            },

            /**
             * Swaps the values of two elements in the collection.
             * @param name1 {string} Name of first item.
             * @param name2 {string} Name of second item.
             */
            swap: function (name1, name2) {
                var tmp = this.items[name1];

                this.set(name1, this.items[name2]);
                this.set(name2, tmp);

                return this;
            },

            /**
             * Swaps the values of two elements in the collection.
             * @param from {string} Original name.
             * @param to {string} New name.
             */
            move: function (from, to) {
                var item;

                // destination name must not exist
                if (!this.items.hasOwnProperty(to)) {
                    item = this.get(from);
                    this.unset(from);
                    this.set(to, item);
                } else {
                    throw "sntls.Collection.rename: Destination item exists.";
                }

                return this;
            },

            /**
             * Calls a function on each item.
             * @param handler {function} Function to call on each item.
             */
            each: function (handler) {
                var items = this.items,
                    item,
                    name;

                for (name in items) {
                    if (items.hasOwnProperty(name)) {
                        item = items[name];
                        if (handler.call(item, items, name, item) === false) {
                            break;
                        }
                    }
                }

                return this;
            }
        });

    return self;
});
