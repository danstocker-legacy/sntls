/*global sntls, troop, module, test, ok, equal, strictEqual, notStrictEqual, deepEqual, notDeepEqual, raises, expect */
(function () {
    "use strict";

    module("Collection");

    test("Object method names", function () {
        deepEqual(
            sntls.Collection._getObjectMethodNames({foo: function () {}, bar: "hello"}),
            ['foo'],
            "Gets method names from object (ES5)"
        );

        // adding user-defined, enumerable method to built-in type
        // _getObjectMethodNames should retrieve those AND built-in method names
        Boolean.prototype.sntlsTest = function () {};

        if (!troop.Feature.hasPropertyAttributes()) {
            deepEqual(
                sntls.Collection._getObjectMethodNames(Boolean.prototype).sort(), // boolean is used b/c of the brevity of its method list
                ["sntlsTest", "toString", "valueOf"],
                "ES3 general purpose object proto"
            );
        }

        delete Boolean.prototype.sntlsTest;
    });

    test("Class method names", function () {
        var MyClass = troop.Base.extend()
            .addMethods({
                foo: function () {}
            })
            .extend()
            .addMethods({
                bar: function () {}
            });

        deepEqual(
            sntls.Collection._getClassMethodNames(MyClass).sort(),
            ['foo', 'bar'].concat(Object.getOwnPropertyNames(troop.Base)).sort(),
            "Gets method names from class"
        );
    });

    test("Shortcuts", function () {
        var mockCollection = sntls.Collection.create({a: 'a', b: 'b'});
        mockCollection.toUpperCase = sntls.Collection._genShortcut('toUpperCase');
        deepEqual(
            mockCollection.toUpperCase().items,
            {a: 'A', b: 'B'},
            "Shortcut method to item methods"
        );
    });

    test("Shortcuts with array buffer", function () {
        var mockCollection = sntls.Collection.create(['a', 'b']),
            result;
        mockCollection.toUpperCase = sntls.Collection._genShortcut('toUpperCase');

        result = mockCollection.toUpperCase();

        ok(result.items instanceof Array, "Array buffer type retained");

        deepEqual(
            result.items,
            ['A', 'B'],
            "Array buffer contents"
        );
    });

    test("Specified collection", function () {
        var StringCollection = sntls.Collection.of(String.prototype),
            FatStringCollection = sntls.Collection.of(String),
            ArrayCollection = sntls.Collection.of(Array.prototype),
            Class = troop.Base.extend()
                .addMethods({
                    init: function (a) {
                        this.a = a;
                    },
                    foo : function (a) {
                        return this.a + ' ' + a;
                    },
                    bar : function () {
                        return this;
                    }
                }),
            ClassCollection = sntls.Collection.of(Class),
            stringData = {
                'foo': "Hello world!",
                'bar': "E pluribus unum"
            },
            arrayData = {
                'foo': ["Hello", "world!"],
                'bar': ["E", "pluribus", "unum"]
            },
            classData = {
                'foo': Class.create('hello'),
                'bar': Class.create('howdy')
            };

        equal(typeof StringCollection.split, 'function', "String method assigned to collection");
        equal(typeof ArrayCollection.join, 'function', "Array method assigned to collection");
        equal(typeof ClassCollection.foo, 'function', "Class method assigned to collection");
        equal(typeof ClassCollection.bar, 'function', "Class method assigned to collection");

        deepEqual(
            StringCollection.create(stringData).split(' ').items,
            arrayData,
            "Splitting over collection of strings"
        );

        deepEqual(
            FatStringCollection.create(stringData).split(' ').items,
            arrayData,
            "Splitting over collection of strings (from fat constructor)"
        );

        deepEqual(
            ArrayCollection.create(arrayData).join(' ').items,
            stringData,
            "Joining over collection of arrays"
        );

        deepEqual(
            ClassCollection.create(classData).foo('world').items,
            {
                foo: "hello world",
                bar: "howdy world"
            },
            "Calling method over collection of troop instances"
        );

        var collection = ClassCollection.create(classData);

        strictEqual(
            collection.bar(),
            collection,
            "Generated collection method chainable for chainable item methods"
        );
    });

    test("Sp. collection of extended class", function () {
        var result = [],
            MyClass = troop.Base.extend()
                .addMethods({
                    init: function () {},
                    foo : function () {
                        result.push('foo');
                    }
                })
                .extend()
                .addMethods({
                    bar: function () {
                        result.push('bar');
                    }
                }),
            MyCollection = sntls.Collection.of(MyClass),
            collection = MyCollection.create({0: MyClass.create()});

        collection.foo();
        deepEqual(result, ['foo'], "Base class method called");

        collection.bar();
        deepEqual(result, ['foo', 'bar'], "Class method called");
    });

    test("Method conflicts (sp. coll)", function () {
        var reg = {
                init          : 0,
                nonConflicting: 0,
                originalFilter: 0,
                customFilter  : 0
            },

            MyClass = troop.Base.extend()
                .addMethods({
                    init: function () {
                        this.foo = 'bar';

                        reg.init++;
                    },

                    nonConflicting: function () {
                        reg.nonConflicting++;
                    },

                    filterByPrefix: function () {
                        reg.customFilter++;
                    }
                }),

            Specified = sntls.Collection.of(MyClass),

            specified = Specified.create();

        equal(typeof sntls.Collection.nonConflicting, 'undefined', "Sanity check, non-conflicting method is absent on Collection");

        strictEqual(Specified.init, sntls.Collection.init, "Init not overridden");
        strictEqual(Specified.filterByPrefix, sntls.Collection.filterByPrefix, "Conflicting method not overridden");
        equal(typeof Specified.nonConflicting, 'function', "Non-conflicting method applied");

        equal(reg.init, 0, "Conflicting .init was not called");

        specified.setItem('foo', MyClass.create());

        // non-conflicting method call
        specified.nonConflicting();
        equal(reg.nonConflicting, 1, "Non conflicting method call counter");

        // legitimate filter expression (conflicting method call)

        sntls.Collection.addMocks({
            filterByPrefix: function () {
                reg.originalFilter++;
            }
        });

        specified.filterByPrefix('f');

        sntls.Collection.removeMocks();

        equal(reg.originalFilter, 1, "Original filter invoked");
        equal(reg.customFilter, 0, "Custom filter not invoked");

        specified.callOnEachItem('filterByPrefix');

        equal(reg.customFilter, 1, "Custom filter invoked by .callOnEachItem");
    });

    test("Specified extended collection", function () {
        var ExtendedCollection = sntls.Collection.extend()
                .addMethods({
                    foo: function () {return "bar";}
                }),
            ExtendedStringCollection = ExtendedCollection.of(String),
            stringData = {
                'foo': "Hello world!",
                'bar': "E pluribus unum"
            },
            arrayData = {
                'foo': ["Hello", "world!"],
                'bar': ["E", "pluribus", "unum"]
            };

        deepEqual(
            ExtendedStringCollection.create(stringData).split(' ').items,
            arrayData,
            "Splitting over extended collection of strings"
        );

        equal(
            ExtendedStringCollection.foo(),
            "bar",
            "Calling method of extended collection (of strings)"
        );
    });

    test("Initializing collection", function () {
        var collection;

        collection = sntls.Collection.create();
        equal(collection.keyCount, 0, "Count initialized to empty");

        collection = sntls.Collection.create({
            0: "hello",
            1: "world",
            2: "what",
            3: "up"
        });

        deepEqual(
            collection.items,
            {
                0: "hello",
                1: "world",
                2: "what",
                3: "up"
            },
            "Items initialized"
        );
        equal(typeof collection.keyCount, 'undefined', "Count remains uninitialized");
    });

    test("Type conversion", function () {
        var hash = sntls.Hash.create(),
            collection = hash.toCollection();

        ok(collection.isA(sntls.Collection), "Hash converted to collection");

        collection = hash.toCollection(sntls.Collection.of(String));

        ok(collection.isA(sntls.Collection), "Hash converted to specified collection");
        equal(typeof collection.split, 'function', "String collection");
    });

    test("Array conversion", function () {
        var buffer = [1, 2, 3, 4],
            hash = buffer.toCollection();

        ok(hash.isA(sntls.Collection), "Is collection");
        strictEqual(hash.items, buffer, "Same buffer");
    });

    test("Building collection", function () {
        var collection = sntls.Collection.create();

        deepEqual(collection.items, {}, "Initial buffer is empty object");
        equal(collection.keyCount, 0, "Initial count");

        collection.setItem('testItem', 2);
        equal(collection.keyCount, 1, "Collection count increased");
        equal(collection.items.testItem, 2, "Numeric value stored in collection");

        collection.setItem('testItem', 6, true);
        equal(collection.keyCount, 1, "Collection count remains the same");
        equal(collection.items.testItem, 6, "Stored item by pre-existing name");

        collection.setItem('otherItem', 'testValue');
        equal(collection.items.otherItem, 'testValue', "String value stored in collection");
    });

    test("Rebasing collection", function () {
        var original = sntls.Collection.create({foo: 'bar'}),
            rebased;

        raises(function () {
            rebased = original.asType('notCollection');
        }, "Invalid collection type");

        rebased = original.asType(sntls.Collection.of(String));
        ok(rebased.isA(sntls.Collection), "Rebased still a collection");
        equal(typeof rebased.split, 'function', "Rebased is specified collection");
        strictEqual(rebased.items, original.items, "Rebased shares items w/ original");
        equal(rebased.keyCount, original.keyCount, "Rebased item count same as in original");
    });

    test("Merging collections", function () {
        var collection1 = sntls.Collection.create({
                foo  : 'bar',
                hello: 'world'
            }),
            collection2 = sntls.Collection.create({
                first : 1,
                second: 2
            }),
            merged = collection1.mergeWith(collection2);

        deepEqual(
            collection1.items,
            {
                foo  : 'bar',
                hello: 'world'
            },
            "Original collection remains intact"
        );

        deepEqual(
            collection2.items,
            {
                first : 1,
                second: 2
            },
            "Original collection remains intact"
        );

        equal(merged.getKeyCount(), 4, "Merged item count");
        deepEqual(
            merged.items,
            {
                foo   : 'bar',
                hello : 'world',
                first : 1,
                second: 2
            },
            "Merged items"
        );
    });

    test("Merging with conflict", function () {
        expect(7);

        var collection1 = sntls.Collection.create({
                foo  : 'bar',
                hello: 'world'
            }),
            collection2 = sntls.Collection.create({
                foo   : 1,
                second: 2
            }),
            merged;

        merged = collection1.mergeWith(collection2);
        equal(merged.getKeyCount(), 3, "Merged item count");
        deepEqual(
            merged.items,
            {
                foo   : 'bar',
                hello : 'world',
                second: 2
            },
            "Merged with default conflict resolution"
        );

        merged = collection1.mergeWith(collection2, function (leftCollection, rightCollection, itemName) {
            notStrictEqual(leftCollection, rightCollection);
            ok(leftCollection.isA(sntls.Collection));
            ok(rightCollection.isA(sntls.Collection));
            return rightCollection.items[itemName];
        });
        equal(merged.getKeyCount(), 3, "Merged item count");
        deepEqual(
            merged.items,
            {
                foo   : 1,
                hello : 'world',
                second: 2
            },
            "Merged with custom conflict resolver"
        );
    });

    test("Merging specified collection", function () {
        var ArrayCollection = sntls.Collection.of(Array),
            specified = ArrayCollection.create({
                a: [1, 2, 3, 4],
                b: [5, 6, 7, 8]
            }),
            invalidColl = sntls.Collection.create({
                foo  : 'bar',
                hello: 'world'
            }),
            validColl = ArrayCollection.create({
                c: [0],
                d: [9]
            }),
            merged;

        raises(function () {
            specified.mergeWith(invalidColl);
        }, "Specified collections don't match");

        merged = specified.mergeWith(validColl);

        ok(merged.isA(ArrayCollection), "Merged is specified collection");
        deepEqual(
            merged.items,
            {
                a: [1, 2, 3, 4],
                b: [5, 6, 7, 8],
                c: [0],
                d: [9]
            },
            "Merged items"
        );
    });

    /**
     * Initializes lookup by filling it with sufficient amount of test data.
     * @param {sntls.Collection} lookup Collection instance.
     */
    function init(lookup) {
        lookup.setItem('one', 'hello');
        lookup.setItem('two', 'world!');
        lookup.setItem('three', 5);
        lookup.setItem('four', {});
        lookup.setItem('five', true);
    }

    test("Querying", function () {
        var collection = sntls.Collection.create();

        equal(typeof collection.getItem('one'), 'undefined', "Querying non-existing item");

        init(collection);

        equal(collection.getItem('one'), 'hello', "Querying string");
        equal(collection.getItem('two'), 'world!', "Querying string");
        equal(collection.getItem('three'), 5, "Querying number");
        deepEqual(collection.getItem('four'), {}, "Querying object");
        equal(collection.getItem('five'), true, "Querying boolean");
    });

    test("Selection by keys", function () {
        var collection = sntls.Collection.create(),
            result;

        init(collection);

        raises(function () {
            collection.filterByKeys('foo', 'bar');
        }, "Invalid item names");

        result = collection.filterByKeys(['one', 'three', 'absent']);

        notStrictEqual(result.items, collection.items, "Different buffer");

        deepEqual(
            result.items,
            {
                one  : 'hello',
                three: 5
            },
            "Items 'one' and 'three' selected"
        );
    });

    test("Selection by keys on array buffer", function () {
        var collection = sntls.Collection.create(['foo', 'friend', 'field', 'boom', 'bar']),
            filtered;

        filtered = collection.filterByKeys([1, 3, 10]);

        ok(filtered.items instanceof Array, "Array type retained");

        deepEqual(
            filtered.items,
            [undefined, 'friend', undefined, 'boom'],
            "Array buffer filtered"
        );
    });

    test("Key extraction (RegExp)", function () {
        var collection = sntls.Collection.create();

        init(collection);

        raises(function () {
            collection.getKeysByRegExp('foo');
        }, "Invalid prefix");

        deepEqual(collection.getKeysByRegExp(/one/), ['one'], "Exact key retrieval");
        deepEqual(collection.getKeysByRegExp(/f\w+/), ['four', 'five'], "Prefix search");
        deepEqual(collection.getKeysByRegExp(/one|three/), ['one', 'three'], "Multiple search");
        deepEqual(collection.getKeysByRegExp(/\w*o\w*/), ['one', 'two', 'four'], "Full-text search");
    });

    test("Key extraction (prefix)", function () {
        var collection = sntls.Collection.create({
            'hello world': 'foo',
            'world hello': 'bar',
            'hello'      : 'all'
        });

        raises(function () {
            collection.getKeysByPrefix(true);
        }, "Invalid prefix");

        deepEqual(collection.getKeysByPrefix('world').sort(), ['world hello'], "Prefix 'world'");
        deepEqual(collection.getKeysByPrefix('hello').sort(), ['hello', 'hello world'], "Prefix 'hello'");
    });

    test("Key extraction wrapped in hash", function () {
        var collection = sntls.Collection.create(),
            result;

        init(collection);

        result = collection.getKeysAsHash();

        ok(result.isA(sntls.Hash), "Keys wrapped in hash");

        deepEqual(result.items, ['one', 'two', 'three', 'four', 'five'], "Items in hash");
    });

    test("Filtering", function () {
        var collection = sntls.Collection.create(),
            filtered;

        init(collection);

        filtered = collection.filterByRegExp(/f\w+/);
        equal(filtered.getBase(), sntls.Collection, "Type of filtered collection is collection");
        deepEqual(filtered.items, {
            four: {},
            five: true
        }, "Result of filtering by regexp");

        filtered = collection.filterByPrefix('f');
        deepEqual(filtered.items, {
            four: {},
            five: true
        }, "String prefix filtering");

        filtered = collection.filterBySelector(function (item) {
            return typeof item === 'string';
        });
        deepEqual(filtered.items, {
            one: 'hello',
            two: 'world!'
        }, "Result of filtering by callback");

        filtered = collection.filterByType('string');
        deepEqual(filtered.items, {
            one: 'hello',
            two: 'world!'
        }, "Strings only");

        filtered = collection.filterByType(Object.prototype);
        deepEqual(filtered.items, {
            four: {}
        }, "Objects only");
    });

    test("Filtering on array buffer", function () {
        var collection = sntls.Collection.create(['foo', 'friend', 'field', 'boom', 'bar']),
            filtered;

        filtered = collection.filterBySelector(function (item) {
            return item[0] === 'b';
        });

        ok(filtered.items instanceof Array, "Array type retained");

        deepEqual(
            filtered.items,
            [undefined, undefined, undefined, 'boom', 'bar'],
            "Array buffer filtered"
        );
    });

    test("Filtering of extended collection", function () {
        var StringCollection = sntls.Collection.of(String.prototype),
            names = StringCollection.create({
                test : 'test',
                hello: 'hello',
                world: 'world!',
                foo  : 'foo',
                bar  : 'bar'
            }),
            filtered = names.filterByRegExp(/^\w*o$/);

        deepEqual(filtered.items, {
            hello: 'hello',
            foo  : 'foo'
        }, "Filtered collection");

        equal(filtered.getBase(), StringCollection, "Type of filtered collection");
        deepEqual(filtered.toUpperCase().items, {
            hello: 'HELLO',
            foo  : 'FOO'
        }, "String method called on filtered string collection");
    });

    test("Removal", function () {
        var collection = sntls.Collection.create(),
            countBefore,
            beforeCount;

        beforeCount = collection.keyCount;
        collection.deleteItem('one');
        equal(collection.keyCount, beforeCount, "Attempting to remove non-existing item fails");

        init(collection);

        deepEqual(
            collection.items,
            {
                'one'  : 'hello',
                'two'  : 'world!',
                'three': 5,
                'four' : {},
                'five' : true
            },
            "Collection before removals"
        );

        countBefore = collection.keyCount;

        collection.deleteItem('one');
        equal(collection.keyCount, countBefore - 1, "Collection count decreased");
        equal(typeof collection.getItem('one'), 'undefined', "Collection item removed");

        collection.deleteItem('three');
        collection.deleteItem('five');

        deepEqual(
            collection.items,
            {
                'two' : 'world!',
                'four': {}
            },
            "Collection after removals"
        );
    });

    test("Sorted value extraction", function () {
        var collection = sntls.Collection.create();

        init(collection);

        deepEqual(
            collection.getSortedValues(),
            [
                true,
                {},
                'hello',
                5,
                'world!'
            ],
            "In order of names"
        );

        deepEqual(
            collection.getSortedValues(function (a, b) {
                return String(collection.items[a]).length - String(collection.items[b]).length;
            }),
            [
                5,
                true,
                'hello',
                'world!',
                {}
            ],
            "In order of serialized length"
        );
    });

    test("Sorted value extraction wrapped", function () {
        var collection = sntls.Collection.create(),
            result;

        init(collection);

        result = collection.getSortedValuesAsHash();

        ok(result.isA(sntls.Hash), "Hash retrieved");

        deepEqual(
            result.items,
            [
                true,
                {},
                'hello',
                5,
                'world!'
            ],
            "Sorted array wrapped in hash"
        );
    });

    test("For Each", function () {
        var collection = sntls.Collection.create();

        init(collection);

        expect(10);

        function handler(item, itemName) {
            /*jshint validthis: true */
            if (Object.isPrototypeOf(item)) {
                deepEqual(item, collection.items[itemName], "Item '" + itemName + "' OK");
            } else {
                equal(item, collection.items[itemName], "Item '" + itemName + "' OK");
            }
            strictEqual(this, collection);
        }

        collection.forEachItem(handler);
    });

    test("For-Next", function () {
        var collection = sntls.Collection.create(),
            order = [];

        init(collection);

        expect(11);

        function handler(item, itemName) {
            /*jshint validthis: true */
            if (Object.isPrototypeOf(item)) {
                deepEqual(item, collection.items[itemName], "Item '" + itemName + "' OK");
            } else {
                equal(item, collection.items[itemName], "Item '" + itemName + "' OK");
            }
            order.push(itemName);
            strictEqual(this, collection);
        }

        collection.forEachItemSorted(handler);

        deepEqual(
            order,
            ['five', 'four', 'one', 'three', 'two'],
            "Items called in order of keys"
        );
    });

    test("For-Next with custom order", function () {
        var collection = sntls.Collection.create(),
            order = [];

        init(collection);

        expect(11); // 2 for each item + 1

        /**
         * Test comparator
         * Compares two strings by their second char
         * @param a
         * @param b
         * @returns {number}
         */
        function comparator(a, b) {
            /*jshint validthis: true */
            var x = a[1],
                y = b[1];
            return x > y ? 1 : y > x ? -1 : 0;
        }

        function handler(item, itemName) {
            /*jshint validthis: true */
            if (Object.isPrototypeOf(item)) {
                deepEqual(item, collection.items[itemName], "Item '" + itemName + "' OK");
            } else {
                equal(item, collection.items[itemName], "Item '" + itemName + "' OK");
            }
            order.push(itemName);
            strictEqual(this, collection);
        }

        collection.forEachItemSorted(handler, undefined, comparator);

        deepEqual(
            order,
            ['three', 'five', 'one', 'four', 'two'],
            "Items called in specified order of keys"
        );
    });

    test("Key mapping", function () {
        var StringCollection = sntls.Collection.of(String),
            collection = sntls.Collection.create({
                foo  : "bar",
                hello: "world",
                howdy: "all"
            }),
            result;

        result = collection.mapKeys(function (item, itemKey) {
            return itemKey.toUpperCase();
        });

        ok(result.isA(sntls.Collection), "Mapping returns collection");
        notStrictEqual(result, collection, "Mapping returns different collection");
        deepEqual(result.items, {
            FOO  : "bar",
            HELLO: "world",
            HOWDY: "all"
        }, "Collection items w/ mapped keys");

        result = collection.mapKeys(function (item, itemKey) {
            return itemKey.toUpperCase();
        }, undefined, undefined, StringCollection);

        ok(result.isA(StringCollection), "Mapping returns specified collection");

        result = collection.mapKeys(function (item, itemKey) {
            return itemKey[0];
        });

        deepEqual(result.items, {
            f: "bar",
            h: "all"
        }, "Collection items w/ conflicting mapped keys");

        result = collection.mapKeys(
            function (item, itemKey) {
                return itemKey[0];
            },
            collection,
            function (value1, value2) {
                if (value1.length > value2.length) {
                    return value1;
                } else {
                    return value2;
                }
            });

        deepEqual(result.items, {
            f: "bar",
            h: "world"
        }, "Collection items w/ resolved conflicting mapped keys");
    });

    test("Key mapping mimicking dictionary reverse", function () {
        var collection = sntls.Collection.create({
                foo  : 'bar',
                baz  : 'bar',
                hello: 'world'
            }),
            result;

        result = collection.mapKeys(
            function (value) {
                return value;
            },
            collection,
            function (value1, value2) {
                if (value1 instanceof Array) {
                    value1.push(value2);
                    return value1;
                } else {
                    return [value1, value2];
                }
            });

        deepEqual(result.items, {
            bar  : ['bar', 'bar'],
            world: 'world'
        });
    });

    test("Value mapping", function () {
        var StringCollection = sntls.Collection.of(String),
            collection = sntls.Collection.create(),
            result;

        function lastChar(item) {
            return item.toString().substr(-1);
        }

        init(collection);

        result = collection.mapValues(lastChar);

        ok(result.instanceOf(sntls.Collection), "Result plain collection");

        deepEqual(
            result.items,
            {
                'one'  : 'o',
                'two'  : '!',
                'three': '5',
                'four' : ']',
                'five' : 'e'
            },
            "To string & last char"
        );

        result = collection.mapValues(lastChar, undefined, StringCollection);

        ok(result.instanceOf(StringCollection), "Result is specified collection");
    });

    test("Property collection", function () {
        var collection = sntls.Collection.create(["foo", null, "bar", undefined, "hello"]),
            NumberCollection = sntls.Collection.of(Number),
            result;

        result = collection.collectProperty('length');
        ok(result.isA(sntls.Collection), "Collection returned");
        deepEqual(result.items, [3, undefined, 3, undefined, 5], "Result contents");

        result = collection.collectProperty('length', NumberCollection);
        ok(result.isA(NumberCollection), "Specified collection returned");
    });

    test("Corben Dallas multi-pass", function () {
        var collection = sntls.Collection.create(["foo", "bar", "baz"]),
            context;

        function splitIntoLetters(str) {
            context = collection;
            return str.split('');
        }

        function split(delim, str) {
            return str.split(delim);
        }

        deepEqual(
            collection.passEachItemTo(splitIntoLetters, collection).items,
            [
                ['f', 'o', 'o'],
                ['b', 'a', 'r'],
                ['b', 'a', 'z']
            ],
            "Items split into letters"
        );

        strictEqual(context, collection, "Context was set");

        deepEqual(
            collection.passEachItemTo(split, null, 1, 'a').items,
            [
                ['foo'],
                ['b', 'r'],
                ['b', 'z']
            ],
            "Items split along specified delmiters"
        );
    });

    test("Creating new instance for each", function () {
        expect(4);

        var collection = sntls.Collection.create(['foo>bar', 'hello>world', 'one>two>three']),
            result;

        collection.addMocks({
            passEachItemTo: function (handler, context) {
                strictEqual(handler, sntls.Path.create, "Handler set to constructor");
                strictEqual(context, sntls.Path, "Context set to class");
            }
        });

        collection.createWithEachItem(sntls.Path);

        collection.removeMocks();

        result = collection.createWithEachItem(sntls.Path);

        ok(result.isA(sntls.Collection), "Result is collection");
        deepEqual(
            result.collectProperty('asArray').items,
            [
                ['foo', 'bar'],
                ['hello', 'world'],
                ['one', 'two', 'three']
            ]
        );
    });

    test("Mapping with array buffer", function () {
        var collection = sntls.Collection.create(['foo', 'bar']),
            result;

        result = collection.mapValues(function (item) {
            return 'a' + item;
        });

        ok(result.items instanceof Array, "Array type retained");

        deepEqual(
            result.items,
            ['afoo', 'abar'],
            "Methods called"
        );
    });

    test("Call-each", function () {
        var collection = sntls.Collection.create(),
            i, result;

        expect(6);

        function test(customArg) {
            equal(customArg, 'custom', "Custom argument");
            return 1;
        }

        for (i = 0; i < 5; i++) {
            collection.setItem(i, {
                test: test
            });
        }

        result = collection.callOnEachItem('test', 'custom');

        deepEqual(result.items, {
            0: 1,
            1: 1,
            2: 1,
            3: 1,
            4: 1
        });
    });

    test("Chainable call-each", function () {
        var collection = sntls.Collection.create(),
            i, result;

        expect(6);

        /*jshint validthis:true */
        function test(customArg) {
            equal(customArg, 'custom', "Custom argument");
            return this;
        }

        for (i = 0; i < 5; i++) {
            collection.setItem(i, {
                test: test
            });
        }

        result = collection.callOnEachItem('test', 'custom');

        strictEqual(result, collection, "All methods returned item reference");
    });

    test("Call each on array buffer", function () {
        var collection = sntls.Collection.create(['foo', 'bar']),
            result;

        result = collection.callOnEachItem('split', '');

        ok(result.items instanceof Array, "Array type retained");

        deepEqual(
            result.items,
            [
                ['f', 'o', 'o'],
                ['b', 'a', 'r']
            ],
            "Methods called"
        );
    });
}());
