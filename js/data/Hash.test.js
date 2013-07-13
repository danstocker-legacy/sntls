/*global module, test, expect, ok, raises, equal, strictEqual, deepEqual */
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

        deepEqual(hash.getKeys(), ['one', 'two', 'three', 'four', 'five'], "Retrieving all keys");
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

        hash = sntls.Hash.create(['foo', 'bar', 'hello', 'world']);

        hash.clear();
        deepEqual(hash.items, [], "Array buffer emptied");
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
