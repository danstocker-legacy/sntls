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
            keys, paths;

        keys = [];
        paths = [];

        sntls.IterativeTreeWalker.walk(obj, function (path, key) {
            paths.push(path.join('.'));
            keys.push(key);
        });

        deepEqual(keys, ['hello', 'foo', 'bar', 'boo', '1', 'moo', 'says'], "Keys read during full traversal");
        deepEqual(paths, ['hello', 'foo', 'foo.bar', 'foo.boo', 'foo.boo.1', 'moo', 'moo.says'
        ], "Paths traversed during full traversal");

        keys = [];
        paths = [];

        // setting up traversal to stop at key '1'
        sntls.IterativeTreeWalker.walk(obj, function (path, key) {
            paths.push(path.join('.'));
            if (key === '1') {
                return false;
            }
            return undefined;
        });

        deepEqual(paths, ['hello', 'foo', 'foo.bar', 'foo.boo', 'foo.boo.1'
        ], "Paths traversed during terminated traversal");
    });
}());
