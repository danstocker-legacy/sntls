////////////////////////////////////////////////////////////////////////////////
// Unit Tests for CineLounge Data Classes
////////////////////////////////////////////////////////////////////////////////
/*global sntls, troop, module, test, ok, equal, deepEqual, raises, expect */
(function (Collection) {
    module("Collection");

    test("Shortcuts", function () {
        var mockCollection = {items: {a: 'a', b: 'b'}};
        mockCollection.toUpperCase = Collection._genShortcut('toUpperCase');
        deepEqual(
            mockCollection.toUpperCase().items,
            {a: 'A', b: 'B'},
            "Shortcut method to item methods"
        );
    });

    test("Extension", function () {
        var StringCollection = Collection.of(String.prototype),
            FatStringCollection = Collection.of(String),
            ArrayCollection = Collection.of(Array.prototype),
            stringData = {
                'foo': "Hello world!",
                'bar': "E pluribus unum"
            },
            arrayData = {
                'foo': ["Hello", "world!"],
                'bar': ["E", "pluribus", "unum"]
            };

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

        deepEqual(collection.keys(/one/), ['one'], "Exact key retrieval");
        deepEqual(collection.keys(/f\w+/), ['four', 'five'], "Prefix search");
        deepEqual(collection.keys(/one|three/), ['one', 'three'], "Multiple search");
        deepEqual(collection.keys(/\w*o\w*/), ['one', 'two', 'four'], "Full-text search");

        filtered = collection.filter(/f\w+/);
        equal(filtered.getBase(), sntls.Collection, "Type of filtered collection is collection");
        deepEqual(filtered.items, {
            four: {},
            five: true
        }, "Result of filtering by regexp");

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
        collection.remove('one');
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

        collection.remove('one');
        equal(collection.count, countBefore - 1, "Collection count decreased");
        equal(typeof collection.get('one'), 'undefined', "Collection item removed");

        collection.remove('three');
        collection.remove('five');

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
