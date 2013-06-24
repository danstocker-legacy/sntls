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
        var tree = sntls.Tree.create({
                hello: "world"
            }),
            path = 'foo>bar'.toPath(),
            result;

        result = tree.getSafeNode(path);

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

    test("Key deletion", function () {
        var tree = sntls.Tree.create({
                foo: {
                    bar: "Hello world!"
                }
            }),
            result;

        result = tree.unsetKey('foo>bar'.toPath());

        strictEqual(result, tree, "Tree.unsetKey is chainable");
        deepEqual(tree.items, {foo: {}}, "Node removed");
    });

    test("Path deletion", function () {
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

        tree.unsetPath('a>f>h>i>j>k>m'.toPath());
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
                .mapContents(function (item) {
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
    });
}());
