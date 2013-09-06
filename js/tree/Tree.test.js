/*global sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Tree");

    test("Instantiation", function () {
        var tree,
            json = {foo: 'bar'};

        tree = sntls.Tree.create();
        deepEqual(tree.items, {}, "Empty root");

        tree = sntls.Tree.create(json);
        strictEqual(tree.items, json, "root initialized with custom value");
    });

    test("Type conversion", function () {
        var hash = sntls.Hash.create(),
            tree = hash.toTree();

        ok(tree.isA(sntls.Tree), "Hash converted to Tree");
    });

    test("Node retrieval", function () {
        var tree = sntls.Tree.create({
            foo: {
                bar: "Hello world!"
            }
        });

        equal(tree.getNode('foo>bar'.toPath()), "Hello world!", "Node retrieved");
        equal(typeof tree.getNode('hello>world'.toPath()), 'undefined', "Attempted to retrieve non-existent node");
    });

    test("Node retrieval as Hash", function () {
        var tree = sntls.Tree.create({
                foo: {
                    bar: "Hello world!"
                }
            }),
            result;

        raises(function () {
            tree.getNodeAsHash('foo>bar'.toPath());
        }, "Primitive can't be hashed");

        result = tree.getNodeAsHash('foo'.toPath());
        ok(result.isA(sntls.Hash), "Result is a hash");
        deepEqual(
            result.items,
            {
                bar: "Hello world!"
            },
            "Result hash' contents"
        );
    });

    test("Safe node retrieval", function () {
        expect(5);

        var tree = sntls.Tree.create({
                hello: "world"
            }),
            path = 'foo>bar'.toPath(),
            result;

        result = tree.getSafeNode(path, function (path, value) {
            equal(path.toString(), 'foo>bar', "Affected path");
            deepEqual(value, {}, "Affected value");
        });

        deepEqual(tree.items, {
            hello: "world",
            foo  : {
                bar: {}
            }
        }, "Path built in tree");
        strictEqual(result, tree.getNode(path), "Safe node retrieval returns new object");

        tree.getSafeNode('hello>world'.toPath());

        deepEqual(tree.items, {
            hello: {
                world: {}
            },
            foo  : {
                bar: {}
            }
        }, "Existing path overwritten");
    });

    test("Node setting", function () {
        var tree = sntls.Tree.create({}),
            result;

        result = tree.setNode('foo>bar'.toPath(), "Hello world!");

        strictEqual(result, tree, "Tree.setNode is chainable");
        deepEqual(
            tree.items,
            {
                foo: {
                    bar: "Hello world!"
                }
            },
            "Tree node set"
        );
    });

    test("Getting or setting node", function () {
        expect(5);

        var json = {
                foo: {
                    bar: "Hello world!"
                }
            },
            tree = sntls.Tree.create(json),
            result;

        result = tree.getOrSetNode('foo>bar'.toPath(), function () {
            return "Whatever";
        });

        equal(result, "Hello world!", "Node retrieved from existing path");

        result = tree.getOrSetNode('hello>world'.toPath(), function () {
            return [];
        }, function (path, value) {
            equal(path.toString(), 'hello>world', "Affected path");
            deepEqual(value, [], "Affected value");
        });

        deepEqual(result, [], "New value generated for new path");
        deepEqual(
            json,
            {
                foo  : {
                    bar: "Hello world!"
                },
                hello: {
                    world: []
                }
            },
            "New path created and value generated/assigned"
        );
    });

    test("Node annulment", function () {
        var tree = sntls.Tree.create({
                foo: {
                    bar: "Hello world!"
                }
            }),
            result;

        result = tree.unsetNode('foo>bar'.toPath());

        strictEqual(result, tree, "Tree.unsetNode is chainable");
        deepEqual(tree.items, {foo: {bar: undefined}}, "Node annulled");
    });

    test("Key deletion from object", function () {
        expect(4);

        var tree = sntls.Tree.create({
                foo: {
                    bar: "Hello world!"
                }
            }),
            result;

        result = tree.unsetKey('foo>bar'.toPath(), false, function (path, value) {
            equal(path.toString(), 'foo>bar', "Affected path");
            equal(typeof value, 'undefined', "Affected value undefined");
        });

        strictEqual(result, tree, "Tree.unsetKey is chainable");
        deepEqual(tree.items, {foo: {}}, "Node removed");
    });

    test("Key deletion from array", function () {
        expect(7);

        var tree = sntls.Tree.create({
            foo: {
                bar: ['hello', 'all', 'the', 'world']
            }
        });

        tree.unsetKey('foo>bar>2'.toPath(), false, function (path, value) {
            equal(path.toString(), 'foo>bar>2', "Affected path");
            equal(typeof value, 'undefined', "Affected value undefined");
        });
        deepEqual(tree.items, {foo: {bar: ['hello', 'all', undefined, 'world']}}, "Node deleted");

        tree.unsetKey('foo>bar>2'.toPath(), true, function (path, value) {
            equal(path.toString(), 'foo>bar', "Affected path");
            deepEqual(value, ['hello', 'all', 'world'], "Affected value undefined");
        });
        deepEqual(tree.items, {foo: {bar: ['hello', 'all', 'world']}}, "Node spliced out");

        tree.unsetKey('foo>bar>2'.toPath(), true);
        deepEqual(tree.items, {foo: {bar: ['hello', 'all']}}, "Node spliced out");
    });

    test("Path deletion in objects", function () {
        expect(8);

        var tree = sntls.Tree.create({
                a: {d: {}, e: {}, f: {
                    g: {}, h: {
                        i: {j: {k: {l: {
                            n: {o: "p"}
                        }, m         : {}}}}
                    }
                }},
                b: {},
                c: {}
            }),
            result;

        result = tree.unsetPath('a>f>h>i>j>k>l>n>o'.toPath());
        strictEqual(result, tree, "Tree.unsetPath is chainable");
        deepEqual(
            tree.items,
            {
                a: {d: {}, e: {}, f: {
                    g: {}, h: {
                        i: {j: {k: {m: {}}}}
                    }
                }},
                b: {},
                c: {}
            },
            "First path removed"
        );

        tree.unsetPath('a>f>h>i>j>k>m'.toPath(), false, function (path, value) {
            equal(path.toString(), 'a>f>h', "Affected path");
            equal(typeof value, 'undefined', "Affected value");
        });
        deepEqual(
            tree.items,
            {
                a: {d: {}, e: {}, f: {
                    g: {}
                }},
                b: {},
                c: {}
            },
            "Second path removed"
        );

        tree.unsetPath('a>f>g'.toPath());
        deepEqual(
            tree.items,
            {
                a: {d: {}, e: {}},
                b: {},
                c: {}
            },
            "Third path removed"
        );

        tree.unsetPath('b'.toPath());
        deepEqual(
            tree.items,
            {
                a: {d: {}, e: {}},
                c: {}
            },
            "Path ending in non-singular node removed"
        );

        tree.unsetPath('a>e>foo'.toPath());
        deepEqual(
            tree.items,
            {
                a: {d: {}, e: {}},
                c: {}
            },
            "Overreaching path not removed"
        );
    });

    test("Path deletion in arrays", function () {
        expect(10);

        var tree = sntls.Tree.create([
            [1, 2, 3],
            [4, 5],
            [
                [6, 7],
                8
            ]
        ]);

        tree.unsetPath([1, 1].toPath(), false, function (path, value) {
            equal(path.toString(), '1>1', "Affected path");
            equal(typeof value, 'undefined', "Affected value");
        });
        deepEqual(
            tree.items,
            [
                [1, 2, 3],
                [4, undefined],
                [
                    [6, 7],
                    8
                ]
            ],
            "Path deleted from array"
        );

        tree.unsetPath([1, 0].toPath(), true, function (/**sntls.Path*/path, value) {
            equal(path.asArray.length, 0, "Affected path");
            deepEqual(value, [
                [1, 2, 3],
                [
                    [6, 7],
                    8
                ]
            ], "Affected value");
        });
        deepEqual(
            tree.items,
            [
                [1, 2, 3],
                [
                    [6, 7],
                    8
                ]
            ],
            "Path spliced out from array"
        );

        tree.unsetPath([1, 0, 0].toPath(), true, function (path, value) {
            equal(path.toString(), '1>0', "Affected path");
            deepEqual(value, [7], "Affected value");
        });
        deepEqual(
            tree.items,
            [
                [1, 2, 3],
                [
                    [7],
                    8
                ]
            ],
            "Path spliced out from array"
        );

        tree.unsetPath([1, 0, 0].toPath(), true);
        deepEqual(
            tree.items,
            [
                [1, 2, 3],
                [8]
            ],
            "Path spliced out from array"
        );
    });

    test("Recursive traversal", function () {
        expect(3);

        var tree = sntls.Tree.create({}),
            handler = function () {};

        sntls.RecursiveTreeWalker.addMocks({
            init: function (h, query) {
                equal(query.toString(), 'foo>|>2', "Query being traversed");
                strictEqual(h, handler, "Handler to be called");
            },

            walk: function (node) {
                strictEqual(node, tree.items, "Walker called");
            }
        });

        tree.traverseByQuery('foo>|>2'.toQuery(), handler);

        sntls.RecursiveTreeWalker.removeMocks();
    });

    test("Iterative traversal", function () {
        expect(2);

        var tree = sntls.Tree.create({}),
            handler = function () {};

        sntls.IterativeTreeWalker.addMocks({
            init: function (h) {
                strictEqual(h, handler, "Handler to be called");
            },

            walk: function (node) {
                strictEqual(node, tree.items, "Walker called");
            }
        });

        tree.traverseAllNodes(handler);

        sntls.IterativeTreeWalker.removeMocks();
    });

    test("Querying", function () {
        var tree = sntls.Tree.create({
            hello: "world",
            foo  : {
                bar: {
                    2: "woohoo"
                },
                boo: {
                    1: "hello again",
                    2: 3
                },
                baz: {
                    1: 1,
                    2: {
                        foo: "bar"
                    },
                    3: 3
                }
            },
            moo  : {
                2   : "what",
                says: "cow"
            }
        });

        deepEqual(
            tree.queryValuesAsHash('foo>|>2'.toQuery()).items,
            ["woohoo", 3, {foo: "bar"}],
            "Values queried"
        );

        deepEqual(
            tree.queryKeysAsHash('foo>|>2'.toQuery()).items,
            ["2", "2", "2"],
            "Keys queried w/ literal as last pattern"
        );

        deepEqual(
            tree.queryKeysAsHash('foo>baz>\\'.toQuery()).items,
            ["1", "foo", "3"],
            "Keys queried w/ skipper as last pattern"
        );

        deepEqual(
            tree.queryPathsAsHash('foo>baz>\\'.toQuery())
                .toCollection()
                .mapValues(function (item) {
                    return item.toString();
                })
                .getValues(),
            ["foo>baz>1", "foo>baz>2>foo", "foo>baz>3"],
            "Paths queried"
        );

        deepEqual(
            tree.queryKeyValuePairsAsHash('foo>baz>\\'.toQuery()).items,
            {
                1  : 1,
                foo: "bar",
                3  : 3
            },
            "Key-value pairs queried"
        );

        deepEqual(
            tree.queryPathValuePairsAsHash('foo>baz>\\'.toQuery()).items,
            {
                "foo>baz>1"    : 1,
                "foo>baz>2>foo": "bar",
                "foo>baz>3"    : 3
            },
            "Path-value pairs queried"
        );

        deepEqual(
            tree.queryPathValuePairsAsHash('\\>|^bar'.toQuery()).items,
            {
                "foo>baz>2>foo": "bar"
            },
            "Path-value pairs queried by value"
        );

        deepEqual(
            tree.queryPathValuePairsAsHash(['\\'.toKeyValuePattern(), '1<2'.toKeyValuePattern().setValue(3)
            ].toQuery()).items,
            {
                "foo>boo>2": 3
            },
            "Path-value pairs queried by value"
        );
    });
}());
