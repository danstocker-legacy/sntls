/*global sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Iterative Tree Walker");

    test("Walking all nodes", function () {
        var obj = {
                hello: "world",
                foo  : {
                    bar: "woohoo",
                    boo: {
                        1: "hello again"
                    }
                },
                moo  : {
                    says: "cow"
                }
            },
            keys,
            paths,
            walker;

        keys = [];
        paths = [];

        walker = sntls.IterativeTreeWalker
            .create(function () {
                paths.push(this.currentPath.toString());
                keys.push(this.currentKey);
            })
            .walk(obj);

        equal(typeof walker.currentKey, 'undefined', "Key reset after traversal");
        equal(typeof walker.currentNode, 'undefined', "Node reset after traversal");
        equal(typeof walker.currentPath, 'undefined', "Path reset after traversal");

        deepEqual(keys, ['hello', 'foo', 'bar', 'boo', '1', 'moo', 'says'], "Keys read during full traversal");
        deepEqual(
            paths,
            [
                'hello',
                'foo',
                'foo>bar',
                'foo>boo',
                'foo>boo>1',
                'moo',
                'moo>says'
            ],
            "Paths traversed during full traversal"
        );

        keys = [];
        paths = [];

        // setting up traversal to stop at key '1'
        sntls.IterativeTreeWalker
            .create(function () {
                paths.push(this.currentPath.toString());
                if (this.currentKey === '1') {
                    return false;
                }
                return undefined;
            })
            .walk(obj);

        deepEqual(
            paths,
            [
                'hello',
                'foo',
                'foo>bar',
                'foo>boo',
                'foo>boo>1'
            ],
            "Paths traversed during terminated traversal"
        );
    });
}());
