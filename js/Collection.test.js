/*global sntls, troop, module, test, ok, equal, strictEqual, deepEqual, notDeepEqual, raises, expect */
(function (Collection) {
    module("Collection");

    test("Method names", function () {
        deepEqual(
            Collection._getES5MethodNames({foo: function () {}, bar: "hello"}),
            ['foo'],
            "Gets method names from object (ES5)"
        );

        if (troop.Feature.hasPropertyAttributes()) {
            strictEqual(Collection._getMethodNames, Collection._getES5MethodNames, "In ES5 same as Object.getOwnPropertyNames");
        } else {
            deepEqual(
                Collection._getMethodNames(Boolean.prototype), // boolean is used b/c of the brevity of its method list
                ["toString", "valueOf"],
                "ES3 general purpose object proto"
            );
        }
    });

    test("Shortcuts", function () {
        var mockCollection = {items: {a: 'a', b: 'b'}};
        mockCollection.toUpperCase = Collection._genShortcut('toUpperCase');
        deepEqual(
            mockCollection.toUpperCase().items,
            {a: 'A', b: 'B'},
            "Shortcut method to item methods"
        );
    });

    test("Specified collection", function () {
        var StringCollection = Collection.of(String.prototype),
            FatStringCollection = Collection.of(String),
            ArrayCollection = Collection.of(Array.prototype),
            Class = troop.Base.extend()
                .addMethod({
                    init: function (a) {
                        this.a = a;
                    },
                    foo : function (a) {
                        return this.a + ' ' + a;
                    }
                }),
            ClassCollection = Collection.of(Class),
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
                filter        : 0
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

                    filter: function () {
                        reg.filter++;
                    }
                }),

            Specified = Collection.of(MyClass),

            specified = Specified.create();

        equal(reg.init, 0, "Conflicting .init was not called");

        specified.set('foo', MyClass.create());

        // non-conflicting method call
        specified.nonConflicting();
        equal(reg.nonConflicting, 1, "Non conflicting method call counter");

        // legitimate filter expression (conflicting method call)
        var filtered = specified.filter('f');

        equal(filtered.isA(Collection), true, "Filter returns collection");
        equal(filtered.isA(Specified), false, "Filter returns non-specified collection");
        equal(reg.filter, 1, "Custom filter ran once");
    });

    test("Specified extended collection", function () {
        var ExtendedCollection = Collection.extend()
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
        var collection = Collection.create({
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

    test("Building collection", function () {
        var collection = Collection.create();

        deepEqual(collection.items, {}, "Initial buffer is empty object");
        equal(collection.count, 0, "Initial count");

        collection.set('testItem', 2);
        equal(collection.count, 1, "Collection count increased");
        equal(collection.items.testItem, 2, "Numeric value stored in collection");

        collection.set('testItem', 6, true);
        equal(collection.count, 1, "Collection count remains the same");
        equal(collection.items.testItem, 6, "Stored item by pre-existing name");

        collection.set('otherItem', 'testValue');
        equal(collection.items.otherItem, 'testValue', "String value stored in collection");
    });

    test("Merging collections", function () {
        var collection1 = Collection.create({
                foo  : 'bar',
                hello: 'world'
            }),
            collection2 = Collection.create({
                first : 1,
                second: 2
            }),
            merged = collection1.merge(collection2);

        equal(
            collection1.items,
            {
                foo  : 'bar',
                hello: 'world'
            },
            "Original collection remains intact"
        );

        equal(
            collection2.items,
            {
                first : 1,
                second: 2
            },
            "Original collection remains intact"
        );

        equal(merged.count, collection1.count + collection2.count, "Merged item count");
        equal(
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

    /**
     * Initializes lookup by filling it with sufficient amount of test data.
     * @param lookup {sntls.Collection} Collection instance.
     */
    function init(lookup) {
        lookup.set('one', 'hello');
        lookup.set('two', 'world!');
        lookup.set('three', 5);
        lookup.set('four', {});
        lookup.set('five', true);
    }

    test("Querying", function () {
        var collection = Collection.create();

        equal(typeof collection.get('one'), 'undefined', "Querying non-existing item");

        init(collection);

        equal(collection.get('one'), 'hello', "Querying string");
        equal(collection.get('two'), 'world!', "Querying string");
        equal(collection.get('three'), 5, "Querying number");
        deepEqual(collection.get('four'), {}, "Querying object");
        equal(collection.get('five'), true, "Querying boolean");
    });

    test("Filtering", function () {
        var collection = Collection.create(),
            filtered;

        init(collection);

        deepEqual(collection.keys(), ['one', 'two', 'three', 'four', 'five'], "Retrieving all keys");
        deepEqual(collection.keys(/one/), ['one'], "Exact key retrieval");
        deepEqual(collection.keys(/f\w+/), ['four', 'five'], "Prefix search");
        deepEqual(collection.keys('f'), ['four', 'five'], "String prefix search");
        deepEqual(collection.keys(/one|three/), ['one', 'three'], "Multiple search");
        deepEqual(collection.keys(/\w*o\w*/), ['one', 'two', 'four'], "Full-text search");

        filtered = collection.filter(/f\w+/);
        equal(filtered.getBase(), sntls.Collection, "Type of filtered collection is collection");
        deepEqual(filtered.items, {
            four: {},
            five: true
        }, "Result of filtering by regexp");

        filtered = collection.filter('f');
        deepEqual(filtered.items, {
            four: {},
            five: true
        }, "String prefix filtering");

        filtered = collection.filter(function () {
            return this instanceof String;
        });
        deepEqual(filtered.items, {
            one: 'hello',
            two: 'world!'
        }, "Result of filtering by callback");
    });

    test("Filtering of extended collection", function () {
        var StringCollection = Collection.of(String.prototype),
            names = StringCollection.create({
                test : 'test',
                hello: 'hello',
                world: 'world!',
                foo  : 'foo',
                bar  : 'bar'
            }),
            filtered = names.filter(/^\w*o$/);

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
        var collection = Collection.create(),
            countBefore,
            beforeCount;

        beforeCount = collection.count;
        collection.unset('one');
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

        collection.unset('one');
        equal(collection.count, countBefore - 1, "Collection count decreased");
        equal(typeof collection.get('one'), 'undefined', "Collection item removed");

        collection.unset('three');
        collection.unset('five');

        deepEqual(
            collection.items,
            {
                'two' : 'world!',
                'four': {}
            },
            "Collection after removals"
        );
    });

    test("Clearing", function () {
        var collection = Collection.create();

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

    test("Array representation", function () {
        var collection = Collection.create();

        init(collection);

        deepEqual(
            collection.asArray(),
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
            collection.asSortedArray(),
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
            collection.asSortedArray(function (a, b) {
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

    test("For Each", function () {
        var collection = Collection.create();

        init(collection);

        expect(10);

        function handler(name, customArg) {
            if (Object.isPrototypeOf(this)) {
                deepEqual(this, collection.items[name], "Item '" + name + "' OK");
            } else {
                equal(this, collection.items[name], "Item '" + name + "' OK");
            }
            equal(customArg, 'custom', "Custom argument");
        }

        collection.forEach(handler, 'custom');
    });

    test("For-Next", function () {
        var collection = Collection.create(),
            order = [];

        init(collection);

        expect(11);

        function handler(name, customArg) {
            if (Object.isPrototypeOf(this)) {
                deepEqual(this, collection.items[name], "Item '" + name + "' OK");
            } else {
                equal(this, collection.items[name], "Item '" + name + "' OK");
            }
            order.push(name);
            equal(customArg, 'custom', "Custom argument");
        }

        collection.forNext(handler, 'custom');

        deepEqual(
            order,
            ['five', 'four', 'one', 'three', 'two'],
            "Items called in order of keys"
        );
    });

    test("Call Each", function () {
        var collection = Collection.create(),
            i, result;

        expect(6);

        function test(customArg) {
            equal(customArg, 'custom', "Custom argument");
            return 1;
        }

        for (i = 0; i < 5; i++) {
            collection.set(i, {
                test: test
            });
        }

        result = collection.callEach('test', 'custom');

        deepEqual(result.items, {
            0: 1,
            1: 1,
            2: 1,
            3: 1,
            4: 1
        });
    });
}(
    sntls.Collection
));
