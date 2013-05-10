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

    test("Removing specified values from items", function () {
        // this is more complicated underneath, but the expression is simple

        var dict = sntls.Dictionary.create({
                foo: ['bar', 'hello'],
                boo: 'bar',
                moo: 'hello'
            }),
            valueToRemove = 'hello';

        var result = dict
            .reverse()
            .removeItem(valueToRemove)
            .reverse();

        deepEqual(
            result.items,
            {
                foo: 'bar',
                boo: 'bar'
            },
            "Specified values removed"
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

    test("Combine with", function () {
        deepEqual(
            sntls.Dictionary.create({
                foo  : 'bar',
                hello: 'world'
            }).combineWith(sntls.Dictionary.create({
                bar  : 'BAR',
                world: 'WORLD'
            })).items,
            {
                foo  : 'BAR',
                hello: 'WORLD'
            },
            "One to one string combine"
        );

        deepEqual(
            sntls.Dictionary.create({
                foo  : 'bar',
                hello: 'world'
            }).combineWith(sntls.Dictionary.create({
                world: 'WORLD'
            })).items,
            {
                hello: 'WORLD'
            },
            "Absent keys on left side"
        );

        deepEqual(
            sntls.Dictionary.create({
                hello: 'world'
            }).combineWith(sntls.Dictionary.create({
                hats : 'off',
                world: 'WORLD'
            })).items,
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
            sntls.Dictionary.create({
                hello: ['there', 'world']
            }).combineWith(sntls.Dictionary.create({
                there: 'THERE',
                world: 'WORLD'
            })).items,
            {
                hello: ['THERE', 'WORLD']
            },
            "Simple array combine"
        );

        deepEqual(
            sntls.Dictionary.create({
                hello: ['there', 'world']
            }).combineWith(sntls.Dictionary.create({
                there: ['over', 'there'],
                world: ['my', 'World']
            })).items,
            {
                hello: ['over', 'there', 'my', 'World']
            },
            "Array concatenation"
        );

        deepEqual(
            sntls.Dictionary.create({
                hello: ['there', 'world']
            }).combineWith(sntls.Dictionary.create({})).items,
            {},
            "Combining with empty dictionary"
        );
    });

    test("Combine with self", function () {
        deepEqual(
            sntls.Dictionary.create({
                foo: ["hello", "world"],
                bar: ["foo"],
                etc: ["bar", "hello"]
            }).combineWithSelf().items,
            {
                bar: ["hello", "world"],
                etc: "foo"
            },
            "Dictionary combined with self"
        );
    });

    test("Combining on left array buffer", function () {
        deepEqual(
            sntls.Dictionary.create(['foo', 'bar'])
                .combineWith(sntls.Dictionary.create({ foo: 'FOO', bar: 'BAR' }))
                .items,
            ['FOO', 'BAR'],
            "Array type of first buffer retained"
        );
    });

    test("Reversal", function () {
        deepEqual(
            sntls.Dictionary.create({
                foo  : 'bar',
                moo  : ['bar', 'cow'],
                hello: 'world'
            }).reverse().items,
            {
                bar  : ['foo', 'moo'],
                cow  : 'moo',
                world: 'hello'
            },
            "Reversed simple dictionary"
        );

        deepEqual(
            sntls.Dictionary.create({
                foo  : 'bar',
                moo  : ['bar', 'cow'],
                hello: 'world'
            }).reverse().reverse().items,
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
            sntls.Dictionary.create({
                foo  : 'bar',
                hello: ['world', 'guys', 'all'],
                big  : ['world', 'bar']
            }).combineWith(sntls.Dictionary.create({
                world: 'Earth',
                bar  : 'BAR',
                guys : ["y'all", 'men']
            })).reverse().items,
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
            sntls.Dictionary.create({
                foo  : 'bar',
                hello: ['world', 'guys', 'all'],
                big  : ['world', 'bar']
            })
                .reverse()
                .combineWith(sntls.Dictionary.create({
                foo: 'whatever',
                big: ['tree', 'house']
            })).items,
            {
                bar  : ['whatever', 'tree', 'house'],
                world: ['tree', 'house']
            },
            "Dictionaries joined by keys"
        );
    });
}());
