/*global module, test, ok, raises, equal, strictEqual, deepEqual */
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
            foo: 'bar',
            hello: 'world'
        });

        result = hash.clear();
        strictEqual(result, hash, "Clearing is chainable");
        deepEqual(hash.items, {}, "Object buffer emptied");

        hash = sntls.Hash.create(['foo', 'bar', 'hello', 'world']);

        hash.clear();
        deepEqual(hash.items, [], "Array buffer emptied");
    });
}());
