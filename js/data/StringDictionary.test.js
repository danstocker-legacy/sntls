/*global module, test, raises, ok, equal, deepEqual */
/*global sntls */
(function () {
    "use strict";

    var StringDictionary = sntls.StringDictionary;

    module("StringDictionary");

    test("Type conversion", function () {
        var hash = sntls.Hash.create(),
            dict = hash.toStringDictionary();

        ok(dict.isA(sntls.StringDictionary), "Hash converted to string dictionary");
    });

    test("Combine with", function () {
        deepEqual(
            StringDictionary.create({
                foo  : 'bar',
                hello: 'world'
            }).combineWith(StringDictionary.create({
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
            StringDictionary.create({
                foo  : 'bar',
                hello: 'world'
            }).combineWith(StringDictionary.create({
                world: 'WORLD'
            })).items,
            {
                hello: 'WORLD'
            },
            "Absent keys on left side"
        );

        deepEqual(
            StringDictionary.create({
                hello: 'world'
            }).combineWith(StringDictionary.create({
                hats : 'off',
                world: 'WORLD'
            })).items,
            {
                hello: 'WORLD'
            },
            "Absent keys on right side"
        );

        deepEqual(
            StringDictionary.create({
                foo  : 'bar',
                hello: 'world'
            }).combineWith(StringDictionary.create({
                hats : 'off',
                world: 'WORLD'
            })).items,
            {
                hello: 'WORLD'
            },
            "Absent keys on both sides"
        );

        deepEqual(
            StringDictionary.create({
                hello: ['there', 'world']
            }).combineWith(StringDictionary.create({
                there: 'THERE',
                world: 'WORLD'
            })).items,
            {
                hello: ['THERE', 'WORLD']
            },
            "Simple array combine"
        );

        deepEqual(
            StringDictionary.create({
                hello: ['there', 'world']
            }).combineWith(StringDictionary.create({
                there: ['over', 'there'],
                world: ['my', 'World']
            })).items,
            {
                hello: ['over', 'there', 'my', 'World']
            },
            "Array concatenation"
        );

        deepEqual(
            StringDictionary.create({
                hello: ['there', 'world']
            }).combineWith(StringDictionary.create({})).items,
            {},
            "Combining with empty dictionary"
        );
    });

    test("Combine with self", function () {
        deepEqual(
            StringDictionary.create({
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
            StringDictionary.create(['foo', 'bar'])
                .combineWith(StringDictionary.create({ foo: 'FOO', bar: 'BAR' }))
                .items,
            ['FOO', 'BAR'],
            "Array type of first buffer retained"
        );
    });

    test("Reversal", function () {
        deepEqual(
            StringDictionary.create({
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
            StringDictionary.create({
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

    test("Reversal with buffer type", function () {
        var dict = StringDictionary.create({
            foo  : 1,
            moo  : 2,
            hello: [3, 4, 0]
        });

        raises(function () {
            dict.reverse('foo');
        }, "Invalid buffer type");

        deepEqual(
            dict.reverse(Array).items,
            ['hello', 'foo', 'moo', 'hello', 'hello'],
            "Reversed dictionary is array"
        );
    });

    test("Integration", function () {
        deepEqual(
            StringDictionary.create({
                foo  : 'bar',
                hello: ['world', 'guys', 'all'],
                big  : ['world', 'bar']
            }).combineWith(StringDictionary.create({
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
            StringDictionary.create({
                foo  : 'bar',
                hello: ['world', 'guys', 'all'],
                big  : ['world', 'bar']
            })
                .reverse()
                .combineWith(StringDictionary.create({
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

    test("Removing specified string values from items", function () {
        // this is more complicated underneath, but the expression is simple

        var dict = StringDictionary.create({
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
}());
