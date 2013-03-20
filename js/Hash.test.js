/*global module, test, raises, equal, deepEqual */
/*global sntls */
(function (Hash) {
    module("Hash");

    test("Instantiation", function () {
        /**
         * @type sntls.Hash
         */
        var hash;

        raises(function () {
            hash = Hash.create('foo');
        }, "Invalid items object");

        hash = Hash.create();
        deepEqual(hash.items, {}, "Empty items property on hash");

        hash = Hash.create({
            foo: 'bar'
        });
        deepEqual(hash.items, {
            foo: 'bar'
        }, "Predefined items property on hash");
    });

    test("Single item addition", function () {
        /**
         * @type {sntls.Hash}
         */
        var hash = Hash.create();

        hash.addItem('foo', 'bar');
        deepEqual(hash.items, {
            foo: 'bar'
        }, "Key-value pair added to hash");

        hash.addItem('hello', 'world');
        deepEqual(hash.items, {
            foo  : 'bar',
            hello: 'world'
        }, "Key-value pair added to hash");

        hash.addItem('foo', 'moo');
        deepEqual(hash.items, {
            foo  : ['bar', 'moo'],
            hello: 'world'
        }, "Value added by existing key");

        hash.addItem('foo', 'boo');
        deepEqual(hash.items, {
            foo  : ['bar', 'moo', 'boo'],
            hello: 'world'
        }, "Value added by existing key");
    });

    test("Array item addition", function () {
        /**
         * @type {sntls.Hash}
         */
        var hash = Hash.create();

        hash.addItem('foo', ['bar']);
        deepEqual(hash.items, {
            foo: 'bar'
        }, "Key-value pair added to hash");

        hash.addItem('hello', ['world']);
        deepEqual(hash.items, {
            foo  : 'bar',
            hello: 'world'
        }, "Key-value pair added to hash");

        hash.addItem('foo', ['moo']);
        deepEqual(hash.items, {
            foo  : ['bar', 'moo'],
            hello: 'world'
        }, "Value added by existing key");

        hash.addItem('foo', ['boo']);
        deepEqual(hash.items, {
            foo  : ['bar', 'moo', 'boo'],
            hello: 'world'
        }, "Value added by existing key");
    });

    test("Item retrieval", function () {
        /**
         * @type {sntls.Hash}
         */
        var hash = Hash.create({
            foo  : ['bar', 'moo', 'boo'],
            hello: 'world'
        });

        raises(function () {
            hash.getItem(true);
        }, "Invalid key");

        equal(hash.getItem('hello'), 'world', "Retrieving string value");
        deepEqual(
            hash.getItem('foo'),
            ['bar', 'moo', 'boo'],
            "Retrieving array value"
        );
        deepEqual(
            hash.getItem(['hello', 'foo']),
            ['world', 'bar', 'moo', 'boo'],
            "Retrieving multiple values"
        );

        deepEqual(
            hash.getItem(['hello', 'INVALID']),
            ['world'],
            "Retrieving invalid values"
        );
    });

    test("Combine with", function () {
        var hash1 = /** @type {sntls.Hash} */ Hash.create({
                foo  : 'bar',
                hello: ['world', '!']
            }),
            hash2 = /** @type {sntls.Hash} */ Hash.create({
                foo  : 'bar',
                bar  : 'BAR',
                world: 'WORLD'
            }),
            result = hash1.combineWith(hash2);

        deepEqual(result.items, {
            foo  : 'BAR',
            hello: 'WORLD'
        }, "Combined");
    });
}(sntls.Hash));
