/*global sntls, troop, module, test, ok, equal, strictEqual, notStrictEqual, deepEqual, notDeepEqual, raises, expect */
(function () {
    "use strict";

    module("Collection");

    test("Method names", function () {
        deepEqual(
            sntls.Collection._getES5MethodNames({foo: function () {}, bar: "hello"}),
            ['foo'],
            "Gets method names from object (ES5)"
        );

        // adding user-defined, enumerable method to built-in type
        // _getMethodNames should retrieve those AND built-in method names
        Boolean.prototype.sntlsTest = function () {};

        if (troop.Feature.hasPropertyAttributes()) {
            strictEqual(sntls.Collection._getMethodNames, sntls.Collection._getES5MethodNames, "In ES5 same as Object.getOwnPropertyNames");
        } else {
            deepEqual(
                sntls.Collection._getMethodNames(Boolean.prototype), // boolean is used b/c of the brevity of its method list
                ["toString", "valueOf", "sntlsTest"],
                "ES3 general purpose object proto"
            );
        }
    });

    test("Shortcuts", function () {
        var mockCollection = {items: {a: 'a', b: 'b'}};
        mockCollection.toUpperCase = sntls.Collection._genShortcut('toUpperCase');
        deepEqual(
            mockCollection.toUpperCase().items,
            {a: 'A', b: 'B'},
            "Shortcut method to item methods"
        );
    });

    test("Shortcuts with array buffer", function () {
        var mockCollection = {items: ['a', 'b']},
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
                .addMethod({
                    init: function (a) {
                        this.a = a;
                    },
                    foo : function (a) {
                        return this.a + ' ' + a;
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
    });

    test("Method conflicts (sp. coll)", function () {
        var reg = {
                init          : 0,
                nonConflicting: 0,
                filterByExpr  : 0
            },

            MyClass = troop.Base.extend()
                .addMethod({
                    init: function () {
                        this.foo = 'bar';

                        reg.init++;
                    },

                    nonConflicting: function () {
                        reg.nonConflicting++;
                    },

                    filterByExpr: function () {
                        reg.filterByExpr++;
                    }
                }),

            Specified = sntls.Collection.of(MyClass),

            specified = Specified.create();

        equal(reg.init, 0, "Conflicting .init was not called");

        specified.setItem('foo', MyClass.create());

        // non-conflicting method call
        specified.nonConflicting();
        equal(reg.nonConflicting, 1, "Non conflicting method call counter");

        // legitimate filter expression (conflicting method call)
        var filtered = specified.filterByExpr('f');

        equal(filtered.isA(sntls.Collection), true, "Filter returns collection");
        equal(filtered.isA(Specified), false, "Filter returns non-specified collection");
        equal(reg.filterByExpr, 1, "Custom filter ran once");
    });

    test("Specified extended collection", function () {
        var ExtendedCollection = sntls.Collection.extend()
                .addMethod({
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
        var collection = sntls.Collection.create({
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
        equal(collection.count, 4, "Count initialized");
    });

    test("Type conversion", function () {
        var hash = sntls.Hash.create(),
            collection = hash.toCollection();

        ok(collection.isA(sntls.Collection), "Hash converted to collection");

        collection = hash.toCollection(sntls.Collection.of(String));

        ok(collection.isA(sntls.Collection), "Hash converted to specified collection");
        equal(typeof collection.split, 'function', "String collection");
    });

    test("Building collection", function () {
        var collection = sntls.Collection.create();

        deepEqual(collection.items, {}, "Initial buffer is empty object");
        equal(collection.count, 0, "Initial count");

        collection.setItem('testItem', 2);
        equal(collection.count, 1, "Collection count increased");
        equal(collection.items.testItem, 2, "Numeric value stored in collection");

        collection.setItem('testItem', 6, true);
        equal(collection.count, 1, "Collection count remains the same");
        equal(collection.items.testItem, 6, "Stored item by pre-existing name");

        collection.setItem('otherItem', 'testValue');
        equal(collection.items.otherItem, 'testValue', "String value stored in collection");
    });

    test("Item addition (RO)", function () {
        var collection = sntls.Collection.create({}, true);

        raises(function () {
            collection.setItem('testItem', 2);
        }, "Item cannot be added");
    });

    test("Cloning collection", function () {
        var original = sntls.Collection.create({
                foo  : 'bar',
                hello: 'world'
            }),
            clone = original.clone();

        deepEqual(original.items, clone.items, "Clone has identical content");
        equal(original.count, clone.count, "Original and clone counts match");
        notStrictEqual(original, clone, "Original and clone different objects");
        notStrictEqual(original.items, clone.items, "Original and clone items different objects");
    });

    test("Cloning with array buffer", function () {
        var original = sntls.Collection.create(['foo', 'bar']),
            clone = original.clone();

        ok (clone.items instanceof Array, "Cloning retains array buffer type");

        deepEqual(clone.items, ['foo', 'bar'], "Clone array buffer");
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
        equal(rebased.count, original.count, "Rebased item count same as in original");
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

        equal(merged.count, collection1.count + collection2.count, "Merged item count");
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
        expect(6);

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
        equal(merged.count, 3, "Merged item count");
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
            ok(leftCollection.isA(sntls.Collection));
            ok(rightCollection.isA(sntls.Collection));
            return rightCollection.items[itemName];
        });
        equal(merged.count, 3, "Merged item count");
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

        result = collection.filterByKeys(['one', 'three']);

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

        filtered = collection.filterByKeys([1, 3]);

        ok(filtered.items instanceof Array, "Array type retained");

        deepEqual(
            filtered.items,
            [undefined, 'friend', undefined, 'boom'],
            "Array buffer filtered"
        );
    });

    test("Key extraction", function () {
        var collection = sntls.Collection.create();

        init(collection);

        deepEqual(collection.getKeys(), ['one', 'two', 'three', 'four', 'five'], "Retrieving all keys");
        deepEqual(collection.getKeys(/one/), ['one'], "Exact key retrieval");
        deepEqual(collection.getKeys(/f\w+/), ['four', 'five'], "Prefix search");
        deepEqual(collection.getKeys('f'), ['four', 'five'], "String prefix search");
        deepEqual(collection.getKeys(/one|three/), ['one', 'three'], "Multiple search");
        deepEqual(collection.getKeys(/\w*o\w*/), ['one', 'two', 'four'], "Full-text search");
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

        filtered = collection.filterByExpr(/f\w+/);
        equal(filtered.getBase(), sntls.Collection, "Type of filtered collection is collection");
        deepEqual(filtered.items, {
            four: {},
            five: true
        }, "Result of filtering by regexp");

        filtered = collection.filterByExpr('f');
        deepEqual(filtered.items, {
            four: {},
            five: true
        }, "String prefix filtering");

        filtered = collection.filterByExpr(function (item) {
            return typeof item === 'string';
        });
        deepEqual(filtered.items, {
            one: 'hello',
            two: 'world!'
        }, "Result of filtering by callback");
    });

    test("Filtering on array buffer", function () {
        var collection = sntls.Collection.create(['foo', 'friend', 'field', 'boom', 'bar']),
            filtered;

        filtered = collection.filterByExpr(function (item) {
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
            filtered = names.filterByExpr(/^\w*o$/);

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

        beforeCount = collection.count;
        collection.deleteItem('one');
        equal(collection.count, beforeCount, "Attempting to remove non-existing item fails");

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

        countBefore = collection.count;

        collection.deleteItem('one');
        equal(collection.count, countBefore - 1, "Collection count decreased");
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

    test("Removal (RO)", function () {
        var collection = sntls.Collection.create();

        init(collection);

        collection.readOnly = true;

        raises(function () {
            collection.deleteItem('one');
        }, "Item cannot be removed");
    });

    test("Clearing", function () {
        var collection = sntls.Collection.create();

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
            "Collection before emptying"
        );

        collection.clear();
        deepEqual(collection.items, {}, "Items buffer after emptying");
        equal(collection.count, 0, "Item count after emptying");
    });

    test("Clearing (RO)", function () {
        var collection = sntls.Collection.create();

        init(collection);

        collection.readOnly = true;

        raises(function () {
            collection.clear();
        }, "Collection cannot be cleared");
    });

    test("Array representation", function () {
        var collection = sntls.Collection.create();

        init(collection);

        deepEqual(
            collection.getValues(),
            [
                'hello',
                'world!',
                5,
                {},
                true
            ],
            "In natural order"
        );

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

    test("Array representation wrapped", function () {
        var collection = sntls.Collection.create(),
            result;

        init(collection);

        result = collection.getValuesAsHash();

        ok(result.isA(sntls.Hash), "Hash retrieved");

        deepEqual(
            result.items,
            [
                'hello',
                'world!',
                5,
                {},
                true
            ],
            "Array wrapped in hash"
        );

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
            order = [],
            result;

        init(collection);

        expect(12); // 2 for each item + 2

        /**
         * Test comparator
         * Compares two strings by their second char
         * @param a
         * @param b
         * @return {number}
         */
        function comparator(a, b) {
            /*jshint validthis: true */
            result = this;
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

        collection.forEachItemSorted(handler, comparator);

        strictEqual(result, collection, "Comparator receives collection as this");

        deepEqual(
            order,
            ['three', 'five', 'one', 'four', 'two'],
            "Items called in specified order of keys"
        );
    });

    test("Mapping", function () {
        var StringCollection = sntls.Collection.of(String),
            collection = sntls.Collection.create(),
            result;

        function lastChar(item) {
            return item.toString().substr(-1);
        }

        init(collection);

        result = collection.mapContents(lastChar);

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

        result = collection.mapContents(lastChar, StringCollection);

        ok(result.instanceOf(StringCollection), "Result is specified collection");
    });

    test("Mapping with array buffer", function () {
        var collection = sntls.Collection.create(['foo', 'bar']),
            result;

        result = collection.mapContents(function (item) {
            return 'a' + item;
        });

        ok(result.items instanceof Array, "Array type retained");

        deepEqual(
            result.items,
            ['afoo', 'abar'],
            "Methods called"
        );
    });

    test("Call Each", function () {
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
