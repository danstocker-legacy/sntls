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
        var StringCollection = Collection.extend(String.prototype),
            ArrayCollection = Collection.extend(Array.prototype),
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
        lookup.set('two', 'world');
        lookup.set('three', 5);
        lookup.set('four', {});
        lookup.set('five', true);
    }

    test("Querying", function () {
        var collection = Collection.create();

        equal(typeof collection.get('one'), 'undefined', "Querying non-existing item");

        init(collection);

        equal(collection.has('one'), true, "Collection has specified item");
        equal(collection.has('thousand'), false, "Collection doesn't have specified item");

        equal(collection.get('one'), 'hello', "Querying string");
        equal(collection.get('two'), 'world', "Querying string");
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

        equal(Object.getPrototypeOf(filtered), sntls.Collection, "Type of filtered collection is collection");
        deepEqual(filtered.items, {
            four: {},
            five: true
        }, "Filter result");
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
                'two'  : 'world',
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
                'two' : 'world',
                'four': {}
            },
            "Collection after removals"
        );
    });

    test("Emptying", function () {
        var collection = Collection.create();

        init(collection);

        deepEqual(
            collection.items,
            {
                'one'  : 'hello',
                'two'  : 'world',
                'three': 5,
                'four' : {},
                'five' : true
            },
            "Collection before emptying"
        );

        collection.empty();
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
                'world',
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
                'world'
            ],
            "In order of names"
        );
    });

    test("Swapping", function () {
        var collection = Collection.create();

        init(collection);

        deepEqual(
            collection.items,
            {
                'one'  : 'hello',
                'two'  : 'world',
                'three': 5,
                'four' : {},
                'five' : true
            },
            "Collection before swapping"
        );

        collection.swap('one', 'two');
        equal(collection.items.one, 'world', "First item assigned value of second");
        equal(collection.items.two, 'hello', "Second item assigned value of first");
    });

    test("Renaming", function () {
        var collection = Collection.create();

        init(collection);

        deepEqual(
            collection.items,
            {
                'one'  : 'hello',
                'two'  : 'world',
                'three': 5,
                'four' : {},
                'five' : true
            },
            "Collection before renaming"
        );

        raises(function () {
            collection.move('one', 'two');
        }, "Renaming to existing item raises error");

        collection.move('one', 'thousand');

        equal(typeof collection.items.one, 'undefined', "Original item after rename");
        equal(collection.items.thousand, 'hello', "New item after rename");
    });

    test("Iterating over collection", function () {
        var collection = Collection.create();

        init(collection);

        expect(10);

        function handler(items, name, item) {
            equal(this, item, "'this' matches item");
            deepEqual(item, items[name], "Item '" + name + "' OK");
        }

        collection.each(handler);
    });
}(
    sntls.Collection
));
