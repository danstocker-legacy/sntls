/*global module, test, raises, ok, equal, deepEqual */
/*global sntls */
(function () {
    "use strict";

    module("Dictionary");

    test("Type conversion", function () {
        var hash = sntls.Hash.create(),
            dict = hash.toDictionary();

        ok(dict.isA(sntls.Dictionary), "Hash converted to dictionary");
    });

    test("Single item addition", function () {
        /**
         * @type {sntls.Dictionary}
         */
        var dict = sntls.Dictionary.create();

        dict.addItem('foo', 'bar');
        deepEqual(dict.items, {
            foo: 'bar'
        }, "Key-value pair added to dictionary");

        dict.addItem('hello', 'world');
        deepEqual(dict.items, {
            foo  : 'bar',
            hello: 'world'
        }, "Key-value pair added to dictionary");

        dict.addItem('foo', 'moo');
        deepEqual(dict.items, {
            foo  : ['bar', 'moo'],
            hello: 'world'
        }, "Value added by existing key");

        dict.addItem('foo', 'boo');
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

        deepEqual(
            dict.items,
            {
                foo  : ['bar', 'woot'],
                hello: 'world'
            },
            "Removed value from item holding many values"
        );

        dict.removeItem('foo', 'bar');

        deepEqual(
            dict.items,
            {
                foo  : 'woot',
                hello: 'world'
            },
            "Single value remains in item"
        );

        dict.removeItem('foo', 'woot');

        deepEqual(
            dict.items,
            {
                hello: 'world'
            },
            "Lat value removed from item"
        );

        dict.removeItem('hello');

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

    test("Item retrieval", function () {
        /**
         * @type {sntls.Dictionary}
         */
        var dict = sntls.Dictionary.create({
            foo  : ['bar', 'moo', 'boo'],
            hello: 'world'
        });

        raises(function () {
            dict.getItem(true);
        }, "Invalid key");

        equal(dict.getItem('hello'), 'world', "Retrieving string value");
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
}());
