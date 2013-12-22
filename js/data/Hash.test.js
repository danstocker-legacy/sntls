/*global module, test, expect, ok, raises, equal, strictEqual, notStrictEqual, deepEqual */
/*global sntls */
(function () {
    "use strict";

    module("Hash");

    test("Instantiation", function () {
        var hash;

        raises(function () {
            hash = sntls.Hash.create('foo');
        }, "Invalid items object");

        hash = sntls.Hash.create();
        deepEqual(hash.items, {}, "Empty items property on hash");

        hash = sntls.Hash.create({
            foo: 'bar'
        });
        deepEqual(hash.items, {
            foo: 'bar'
        }, "Predefined items property on hash");
    });

    test("Cloning hash", function () {
        var original = sntls.Hash.create({
                foo  : 'bar',
                hello: 'world'
            }),
            clone = original.clone();

        deepEqual(original.items, clone.items, "Clone has identical content");
        equal(original.keyCount, clone.keyCount, "Original and clone counts match");
        notStrictEqual(original, clone, "Original and clone different objects");
        notStrictEqual(original.items, clone.items, "Original and clone items different objects");
    });

    test("Cloning with array buffer", function () {
        var original = sntls.Hash.create(['foo', 'bar']),
            clone = original.clone();

        ok(clone.items instanceof Array, "Cloning retains array buffer type");

        deepEqual(clone.items, ['foo', 'bar'], "Clone array buffer");
    });

    test("Single key & value extraction", function () {
        var hash;

        hash = sntls.Hash.create({});
        equal(typeof hash.getFirstKey(), 'undefined', "First key in empty hash");
        equal(typeof hash.getFirstValue(), 'undefined', "First value in empty hash");

        hash = sntls.Hash.create({hello: 'world'});
        equal(hash.getFirstKey(), 'hello', "First key in singular hash");
        equal(hash.getFirstValue(), 'world', "First value in singular hash");

        hash = sntls.Hash.create({
            one : 'hello',
            two : 'world!',
            four: {},
            five: true
        });
        ok(['one', 'two', 'four', 'five'].indexOf(hash.getFirstKey()) > -1, "First key in regular hash");
        ok(['hello', 'world!', 5, true].indexOf(hash.getFirstValue()) > -1, "First value in regular hash");
    });

    test("Key extraction", function () {
        var hash = sntls.Hash.create({
            one  : 'hello',
            two  : 'world!',
            three: 5,
            four : {},
            five : true
        });

        equal(typeof this.keyCount, 'undefined', "Key count initially unset");
        deepEqual(hash.getKeys().sort(), ['five', 'four', 'one', 'three', 'two'], "Retrieving all keys");
        equal(hash.keyCount, 5, "Extraction sets key count");
    });

    test("Key counter", function () {
        var hash = sntls.Hash.create({
            one  : 'hello',
            two  : 'world!',
            three: 5,
            four : {},
            five : true
        });

        equal(typeof this.keyCount, 'undefined', "Key count initially unset");
        equal(hash.getKeyCount(), 5, "Counter ran");
        equal(hash.keyCount, 5, "Key count set after first call");
    });

    test("Value extraction", function () {
        var hash = sntls.Hash.create({
            one  : 'hello',
            two  : 'world!',
            three: 5,
            four : {},
            five : true
        });

        deepEqual(
            hash.getValues(),
            [
                'hello',
                'world!',
                5,
                {},
                true
            ],
            "In natural order"
        );
    });

    test("ValueExtraction wrapped", function () {
        var hash = sntls.Hash.create({
                one  : 'hello',
                two  : 'world!',
                three: 5,
                four : {},
                five : true
            }),
            result;

        result = hash.getValuesAsHash();

        ok(result.isA(sntls.Hash), "Hash retrieved");

        deepEqual(
            result.items,
            [
                'hello',
                'world!',
                5,
                {},
                true
            ],
            "Array wrapped in hash"
        );
    });

    test("Buffer type change", function () {
        var hash,
            result;

        hash = sntls.Hash.create({
            0: 'hello',
            1: 'world',
            3: '!'
        });

        result = hash.changeBufferTypeTo(Array);

        strictEqual(result, hash, "Buffer change is chainable");
        deepEqual(
            hash.items,
            ['hello', 'world', undefined, '!'],
            "Buffer converted to array"
        );
        equal(typeof hash.keyCount, 'undefined', "Key count reset");

        hash.changeBufferTypeTo(Object);

        deepEqual(
            hash.items,
            {
                0: 'hello',
                1: 'world',
                3: '!'
            },
            "Buffer converted to object"
        );
    });

    test("Clearing", function () {
        var hash,
            result;

        hash = sntls.Hash.create({
            foo  : 'bar',
            hello: 'world'
        });

        result = hash.clear();
        strictEqual(result, hash, "Clearing is chainable");
        deepEqual(hash.items, {}, "Object buffer emptied");
        equal(hash.keyCount, 0, "Counter reset");

        hash = sntls.Hash.create(['foo', 'bar', 'hello', 'world']);

        hash.clear();
        deepEqual(hash.items, [], "Array buffer emptied");
        equal(hash.keyCount, 0, "Counter reset");
    });

    test("Passing buffer to handler", function () {
        expect(5);

        var hash,
            result;

        hash = sntls.Hash.create({
            foo  : 'bar',
            hello: 'world'
        });

        function handler1(items) {
            /*jshint validthis:true */
            strictEqual(this, hash, "Context specified");
            strictEqual(items, hash.items, "Items passed as 1st arg");
            return 'foo';
        }

        function handler2(foo, bar, items, baz) {
            strictEqual(items, hash.items, "Items passed as 3rd arg");
        }

        result = hash.passItemsTo(handler1, hash);

        equal(result, 'foo', "Passer returns handler result");

        raises(function () {
            hash.passItemsTo(handler1, hash, 3);
        }, "Invalid argument index");

        hash.passItemsTo(handler2, hash, 2, 'foo', 'bar', 'world');
    });

    test("Passing self to handler", function () {
        expect(5);

        var hash,
            result;

        hash = sntls.Hash.create({
            foo  : 'bar',
            hello: 'world'
        });

        function handler1(item) {
            /*jshint validthis:true */
            strictEqual(this, hash, "Context specified");
            strictEqual(item, hash, "Hash passed as 1st arg");
            return 'foo';
        }

        function handler2(foo, bar, item, baz) {
            strictEqual(item, hash, "Items passed as 3rd arg");
        }

        result = hash.passSelfTo(handler1, hash);

        equal(result, 'foo', "Passer returns handler result");

        raises(function () {
            hash.passSelfTo(handler1, hash, 3);
        }, "Invalid argument index");

        hash.passSelfTo(handler2, hash, 2, 'foo', 'bar', 'world');
    });
}());
