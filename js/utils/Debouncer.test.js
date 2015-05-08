/*global dessert, troop, sntls, sntls */
/*global module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, notDeepEqual, raises */
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
        equal(typeof debounced.debounceTimer, 'undefined', "should set debounceTimer property to undefined");
    });

    test("Conversion from function", function () {
        function foo() {
        }

        var debouncer = foo.toDebouncer();

        ok(debouncer.isA(sntls.Debouncer), "should return Debouncer instance");
        strictEqual(debouncer.originalFunction, foo, "should set originalFunction property");
    });

    test("Method invocation", function () {
        expect(5);

        var args = [];

        function foo() {
            args = Array.prototype.slice.call(arguments);
        }

        var debounced = sntls.Debouncer.create(foo);

        debounced.debounceTimer = 5;

        debounced.addMocks({
            _clearTimeoutProxy: function (timer) {
                equal(timer, 5, "should clear timeout when timer is set");
            },

            _setTimeoutProxy: function (func, delay) {
                equal(delay, 100, "should pass delay to setTimeout");
                func();
                return 10;
            }
        });

        strictEqual(debounced.runDebounced(100, 'hello'), debounced, "should be chainable");

        equal(debounced.debounceTimer, 10, "should set new timer");
        deepEqual(args, ['hello'], "should pass arguments to debounced method");
    });
}());
