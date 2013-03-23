/*global module, test, raises, equal, deepEqual */
/*global sntls */
(function (Dictionary) {
    module("Dictionary");

    test("Instantiation", function () {
        /**
         * @type sntls.Dictionary
         */
        var dict;

        raises(function () {
            dict = Dictionary.create('foo');
        }, "Invalid items object");

        dict = Dictionary.create();
        deepEqual(dict.items, {}, "Empty items property on dictionary");

        dict = Dictionary.create({
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
        var dict = Dictionary.create();

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
        var dict = Dictionary.create();

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
        var dict = Dictionary.create();

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
        var dict = Dictionary.create({
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
    });

    test("Combine with", function () {
        deepEqual(
            Dictionary.create({
                foo  : 'bar',
                hello: 'world'
            }).combineWith(Dictionary.create({
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
            Dictionary.create({
                foo  : 'bar',
                hello: 'world'
            }).combineWith(Dictionary.create({
                world: 'WORLD'
            })).items,
            {
                hello: 'WORLD'
            },
            "Absent keys on left side"
        );

        deepEqual(
            Dictionary.create({
                hello: 'world'
            }).combineWith(Dictionary.create({
                hats : 'off',
                world: 'WORLD'
            })).items,
            {
                hello: 'WORLD'
            },
            "Absent keys on right side"
        );

        deepEqual(
            Dictionary.create({
                foo  : 'bar',
                hello: 'world'
            }).combineWith(Dictionary.create({
                hats : 'off',
                world: 'WORLD'
            })).items,
            {
                hello: 'WORLD'
            },
            "Absent keys on both sides"
        );

        deepEqual(
            Dictionary.create({
                hello: ['there', 'world']
            }).combineWith(Dictionary.create({
                there: 'THERE',
                world: 'WORLD'
            })).items,
            {
                hello: ['THERE', 'WORLD']
            },
            "Simple array combine"
        );

        deepEqual(
            Dictionary.create({
                hello: ['there', 'world']
            }).combineWith(Dictionary.create({
                there: ['over', 'there'],
                world: ['my', 'World']
            })).items,
            {
                hello: ['over', 'there', 'my', 'World']
            },
            "Array concatenation"
        );
    });

    test("Flip", function () {
        deepEqual(
            Dictionary.create({
                foo  : 'bar',
                moo  : ['bar', 'cow'],
                hello: 'world'
            }).flip().items,
            {
                bar  : ['foo', 'moo'],
                cow  : 'moo',
                world: 'hello'
            },
            "Flipped simple dictionary"
        );
    });

    test("Integration", function () {
        deepEqual(
            Dictionary.create({
                foo  : 'bar',
                hello: ['world', 'guys', 'all'],
                big  : ['world', 'bar']
            }).combineWith(Dictionary.create({
                world: 'Earth',
                bar  : 'BAR',
                guys : ["y'all", 'men']
            })).flip().items,
            {
                "y'all": 'hello',
                BAR    : ['foo', 'big'],
                Earth  : ['hello', 'big'],
                men    : 'hello'
            },
            "Flipped combined dictionaries"
        );
    });
}(sntls.Dictionary));
