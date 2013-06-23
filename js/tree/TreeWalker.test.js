/*global sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Tree Walker");

    test("Instantiation", function () {
        function handler() {}

        raises(function () {
            sntls.TreeWalker.create();
        }, "Invalid walker handler");

        var walker = /** @type {sntls.IterativeTreeWalker} */ sntls.TreeWalker.create(handler);

        strictEqual(walker.handler, handler, "Handler assigned");
        equal(typeof walker.currentKey, 'undefined', "Key uninitialized");
        equal(typeof walker.currentNode, 'undefined', "Node uninitialized");
        equal(typeof walker.currentPath, 'undefined', "Path uninitialized");
    });

    test("Reset", function () {
        function handler() {}

        var walker = sntls.TreeWalker.create(handler),
            result;

        walker.currentKey = 'foo';
        walker.currentNode = {};
        walker.currentPath = 'bar.foo'.toPath();

        result = walker.reset();

        strictEqual(result, walker, "Reset is chainable");
        equal(typeof walker.currentKey, 'undefined', "Key reset");
        equal(typeof walker.currentNode, 'undefined', "Node reset");
        equal(typeof walker.currentPath, 'undefined', "Path reset");
    });
}());
