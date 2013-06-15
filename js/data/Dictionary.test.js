/*global module, test, expect, raises, ok, equal, deepEqual */
/*global sntls */
(function () {
    "use strict";

    module("Dictionary");

    test("Type conversion", function () {
        var hash = sntls.Hash.create(),
            dict = hash.toDictionary();

        ok(dict.isA(sntls.Dictionary), "Hash converted to dictionary");
    });

    test("Value count", function () {
        equal(
            sntls.Dictionary._countValues({
                foo  : ['bar', 'moo'],
                hello: 'world'
            }),
            3,
            "Two in array, one aside"
        );
    });

    test("Instantiation", function () {
        var dict;

        dict = sntls.Dictionary.create();

        equal(dict.itemCount, 0, "Item count in empty buffer");
        equal(dict.valueCount, 0, "Value count in empty buffer");

        dict = sntls.Dictionary.create({
            foo  : ['bar', 'moo'],
            hello: 'world'
        });

        equal(dict.itemCount, 2, "Item count in populated buffer");
        equal(dict.valueCount, 3, "Value count in populated buffer");
    });

    test("Single item addition", function () {
        /**
         * @type {sntls.Dictionary}
         */
        var dict = sntls.Dictionary.create();

        dict.addItem('foo', 'bar');
        equal(dict.itemCount, 1, "Item count");
        equal(dict.valueCount, 1, "Value count");
        deepEqual(dict.items, {
            foo: 'bar'
        }, "Key-value pair added to dictionary");

        dict.addItem('hello', 'world');
        equal(dict.itemCount, 2, "Item count");
        equal(dict.valueCount, 2, "Value count");
        deepEqual(dict.items, {
            foo  : 'bar',
            hello: 'world'
        }, "Key-value pair added to dictionary");

        dict.addItem('foo', 'moo');
        equal(dict.itemCount, 2, "Item count");
        equal(dict.valueCount, 3, "Value count");
        deepEqual(dict.items, {
            foo  : ['bar', 'moo'],
            hello: 'world'
        }, "Value added by existing key");

        dict.addItem('foo', 'boo');
        equal(dict.itemCount, 2, "Item count");
        equal(dict.valueCount, 4, "Value count");
        deepEqual(dict.items, {
            foo  : ['bar', 'moo', 'boo'],
            hello: 'world'
        }, "Value added by existing key");
    });

    test("Array item addition", function () {
        /**
         * @type {sntls.Dictionary}
         */
        var dict = sntls.Dictionary.create();

        dict.addItem('foo', ['bar']);
        deepEqual(dict.items, {
            foo: 'bar'
        }, "Key-value pair added to dictionary");

        dict.addItem('hello', ['world']);
        deepEqual(dict.items, {
            foo  : 'bar',
            hello: 'world'
        }, "Key-value pair added to dictionary");

        dict.addItem('foo', ['moo']);
        deepEqual(dict.items, {
            foo  : ['bar', 'moo'],
            hello: 'world'
        }, "Value added by existing key");

        dict.addItem('foo', ['boo']);
        deepEqual(dict.items, {
            foo  : ['bar', 'moo', 'boo'],
            hello: 'world'
        }, "Value added by existing key");
    });

    test("Item addition to multiple keys", function () {
        /**
         * @type {sntls.Dictionary}
         */
        var dict = sntls.Dictionary.create();

        raises(function () {
            dict.addItems('foo', 'bar');
        }, "Invalid keys");

        dict.addItems(['foo', 'boo'], 'bar');
        deepEqual(dict.items, {
            foo: 'bar',
            boo: 'bar'
        }, "Key-value pairs added to dictionary");

        dict.addItems(['foo', 'moo'], 'hello');
        deepEqual(dict.items, {
            foo: ['bar', 'hello'],
            boo: 'bar',
            moo: 'hello'
        }, "More key-value pairs added to dictionary");
    });

    test("Item removal", function () {
        var dict = sntls.Dictionary.create({
            foo  : ['bar', 'BAR', 'woot'],
            hello: 'world'
        });

        dict.removeItem('foo', 'BAR');

        equal(dict.itemCount, 2, "Item count");
        equal(dict.valueCount, 3, "Value count");
        deepEqual(
            dict.items,
            {
                foo  : ['bar', 'woot'],
                hello: 'world'
            },
            "Removed value from item holding many values"
        );

        dict.removeItem('foo', 'bar');

        equal(dict.itemCount, 2, "Item count");
        equal(dict.valueCount, 2, "Value count");
        deepEqual(
            dict.items,
            {
                foo  : 'woot',
                hello: 'world'
            },
            "Single value remains in item"
        );

        dict.removeItem('foo', 'woot');

        equal(dict.itemCount, 1, "Item count");
        equal(dict.valueCount, 1, "Value count");
        deepEqual(
            dict.items,
            {
                hello: 'world'
            },
            "Lat value removed from item"
        );

        dict.removeItem('hello');

        equal(dict.itemCount, 0, "Item count");
        equal(dict.valueCount, 0, "Value count");
        deepEqual(
            dict.items,
            {},
            "Full item removed"
        );
    });

    test("Multiple items removal", function () {
        var dict = sntls.Dictionary.create({
            foo: ['bar', 'hello'],
            boo: 'bar',
            moo: 'hello'
        });

        raises(function () {
            dict.removeItems('foo');
        }, "Invalid keys");

        dict.removeItems(['foo', 'moo']);

        deepEqual(
            dict.items,
            {
                boo: 'bar'
            },
            "Two items removed"
        );
    });

    test("Multiple values removal", function () {
        var dict = sntls.Dictionary.create({
            foo: ['bar', 'hello'],
            boo: 'bar',
            moo: 'hello'
        });

        dict.removeItems(['foo', 'moo'], 'hello');

        deepEqual(
            dict.items,
            {
                foo: 'bar',
                boo: 'bar'
            },
            "One value removed from two items"
        );
    });

    test("Item retrieval", function () {
        /**
         * @type {sntls.Dictionary}
         */
        var dict = sntls.Dictionary.create({
            foo  : ['bar', 'moo', 'boo'],
            hello: 'world',
            1    : 'howdy'
        });

        raises(function () {
            dict.getItem(true);
        }, "Invalid key");

        equal(dict.getItem(1), 'howdy', "Retrieving by numeric key");

        equal(dict.getItem('hello'), 'world', "Retrieving by string key");
        deepEqual(
            dict.getItem('foo'),
            ['bar', 'moo', 'boo'],
            "Retrieving array value"
        );
        deepEqual(
            dict.getItem(['hello', 'foo']),
            ['world', 'bar', 'moo', 'boo'],
            "Retrieving multiple values"
        );

        deepEqual(
            dict.getItem(['hello', 'INVALID']),
            ['world'],
            "Retrieving invalid values"
        );

        deepEqual(
            dict.getItem('INVALID1'),
            undefined,
            "Retrieving non-existing item"
        );

        deepEqual(
            dict.getItem(['INVALID1', 'INVALID2']),
            undefined,
            "Retrieving non existing items"
        );
    });

    test("Clearing", function () {
        expect(3);

        var dict = sntls.Dictionary.create({
            foo  : 'bar',
            hello: ['world', 'all']
        });

        sntls.Hash.addMocks({
            clear: function () {
                ok(true, "Base clear called");
            }
        });

        dict.clear();
        equal(dict.itemCount, 0, "Item count after emptying");
        equal(dict.valueCount, 0, "Value count after emptying");

        sntls.Hash.removeMocks();
    });
}());
