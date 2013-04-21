/*global module, test, raises, equal, deepEqual */
/*global sntls */
(function () {
    "use strict";

    module("Dictionary");

    test("Instantiation", function () {
        /**
         * @type sntls.Dictionary
         */
        var dict;

        raises(function () {
            dict = sntls.Dictionary.create('foo');
        }, "Invalid items object");

        dict = sntls.Dictionary.create();
        deepEqual(dict.items, {}, "Empty items property on dictionary");

        dict = sntls.Dictionary.create({
            foo: 'bar'
        });
        deepEqual(dict.items, {
            foo: 'bar'
        }, "Predefined items property on dictionary");
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

    test("Item retrieval", function () {
        /**
         * @type {sntls.Dictionary}
         */
        var dict = {
            foo  : ['bar', 'moo', 'boo'],
            hello: 'world'
        }.toDictionary();

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
    });

    test("Combine with", function () {
        deepEqual(
            {
                foo  : 'bar',
                hello: 'world'
            }.toDictionary().combineWith({
                bar  : 'BAR',
                world: 'WORLD'
            }.toDictionary()).items,
            {
                foo  : 'BAR',
                hello: 'WORLD'
            },
            "One to one string combine"
        );

        deepEqual(
            {
                foo  : 'bar',
                hello: 'world'
            }.toDictionary().combineWith({
                world: 'WORLD'
            }.toDictionary()).items,
            {
                hello: 'WORLD'
            },
            "Absent keys on left side"
        );

        deepEqual(
            {
                hello: 'world'
            }.toDictionary().combineWith({
                hats : 'off',
                world: 'WORLD'
            }.toDictionary()).items,
            {
                hello: 'WORLD'
            },
            "Absent keys on right side"
        );

        deepEqual(
            sntls.Dictionary.create({
                foo  : 'bar',
                hello: 'world'
            }).combineWith(sntls.Dictionary.create({
                hats : 'off',
                world: 'WORLD'
            })).items,
            {
                hello: 'WORLD'
            },
            "Absent keys on both sides"
        );

        deepEqual(
            {
                hello: ['there', 'world']
            }.toDictionary().combineWith({
                there: 'THERE',
                world: 'WORLD'
            }.toDictionary()).items,
            {
                hello: ['THERE', 'WORLD']
            },
            "Simple array combine"
        );

        deepEqual(
            {
                hello: ['there', 'world']
            }.toDictionary().combineWith({
                there: ['over', 'there'],
                world: ['my', 'World']
            }.toDictionary()).items,
            {
                hello: ['over', 'there', 'my', 'World']
            },
            "Array concatenation"
        );
    });

    test("Reversal", function () {
        deepEqual(
            {
                foo  : 'bar',
                moo  : ['bar', 'cow'],
                hello: 'world'
            }.toDictionary().reverse().items,
            {
                bar  : ['foo', 'moo'],
                cow  : 'moo',
                world: 'hello'
            },
            "Reversed simple dictionary"
        );

        deepEqual(
            {
                foo  : 'bar',
                moo  : ['bar', 'cow'],
                hello: 'world'
            }.toDictionary().reverse().reverse().items,
            {
                foo  : 'bar',
                moo  : ['bar', 'cow'],
                hello: 'world'
            },
            "Reverse-reversed simple dictionary"
        );
    });

    test("Integration", function () {
        deepEqual(
            {
                foo  : 'bar',
                hello: ['world', 'guys', 'all'],
                big  : ['world', 'bar']
            }.toDictionary().combineWith({
                world: 'Earth',
                bar  : 'BAR',
                guys : ["y'all", 'men']
            }.toDictionary()).reverse().items,
            {
                "y'all": 'hello',
                BAR    : ['foo', 'big'],
                Earth  : ['hello', 'big'],
                men    : 'hello'
            },
            "Reversed combined dictionaries"
        );
    });

    test("Joining", function () {
        deepEqual(
            {
                foo  : 'bar',
                hello: ['world', 'guys', 'all'],
                big  : ['world', 'bar']
            }.toDictionary()
                .reverse()
                .combineWith({
                foo: 'whatever',
                big: ['tree', 'house']
            }.toDictionary()).items,
            {
                bar  : ['whatever', 'tree', 'house'],
                world: ['tree', 'house']
            },
            "Dictionaries joined by keys"
        );
    });
}());
