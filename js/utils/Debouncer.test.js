/*global dessert, troop, sntls, sntls */
/*global module, test, asyncTest, start, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, notDeepEqual, raises */
(function () {
    "use strict";

    module("Debouncer");

    test("Instantiation", function () {
        raises(function () {
            sntls.Debouncer.create();
        }, "should raise exception on missing argument");

        raises(function () {
            sntls.Debouncer.create('foo');
        }, "should raise exception on invalid argument");

        function originalFunction() {
        }

        var debounced = sntls.Debouncer.create(originalFunction);

        strictEqual(debounced.originalFunction, originalFunction, "should set originalFunction property to argument");
        ok(debounced.hasOwnProperty('debounceTimer'), "should add debounceTimer property");
        equal(typeof debounced.debounceTimer, 'undefined',
            "should set debounceTimer property to undefined");
        equal(typeof debounced.debounceDeferred, 'undefined',
            "should set debounceDeferred property to undefined");
    });

    test("Conversion from function", function () {
        function foo() {
        }

        var debouncer = foo.toDebouncer();

        ok(debouncer.isA(sntls.Debouncer), "should return Debouncer instance");
        strictEqual(debouncer.originalFunction, foo, "should set originalFunction property");
    });

    asyncTest("Debounced call", function () {
        expect(6);

        var result = {};

        function foo() {
            var args = Array.prototype.slice.call(arguments);
            deepEqual(args, ['world'],
                "should call debounced method eventually and pass arguments of last call");
            equal(typeof debouncer.debounceTimer, 'undefined',
                "should clear debounceTimer before calling original function");
            equal(typeof debouncer.debounceDeferred, 'undefined',
                "should clear debounceDeferred before calling original function");
            return result;
        }

        var debouncer = foo.toDebouncer();

        debouncer.runDebounced(100, 'hello')
            .then(function () {
                ok(true, "should resolve promise for skipped call");
            });

        debouncer.runDebounced(200, 'world')
            .then(function (value) {
                ok(true, "should resolve promise for last call");
                strictEqual(value, result,
                    "should resolve with value returned by original function");
            })
            .then(function () {
                start();
            });
    });
}());
