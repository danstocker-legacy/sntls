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

    test("Array conversion", function () {
        var buffer = [1, 2, 3, 4],
            hash = buffer.toTree();

        ok(hash.isA(sntls.Tree), "Is tree");
        strictEqual(hash.items, buffer, "Same buffer");
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

    test("Node setter", function () {
        expect(6);

        var tree = sntls.Tree.create({});

        strictEqual(tree.setNode('foo>bar'.toPath(), "Hello world!", function (path, node) {
            ok(path.equals('foo'.toPath()),
                "should pass parent path to handler when adding new property");
            deepEqual(node, {
                bar: "Hello world!"
            }, "should pass parent node to handler when adding new property");
        }), tree, "should be chainable");

        deepEqual(tree.items, {
            foo: {
                bar: "Hello world!"
            }
        }, "should set node in tree");

        tree.setNode('foo>bar'.toPath(), "Hello world!", function () {
            ok(false, "should NOT invoke handler when setting the same value");
        });

        tree.setNode('foo>bar'.toPath(), "Hi all!", function (path, node) {
            ok(path.equals('foo>bar'.toPath()),
                "should pass target path to handler when changing existing property");
            equal(node, "Hi all!",
                "should pass new node to handler when changing existing property");
        });
    });

    test("Appending object to object", function () {
        expect(4);

        var tree = sntls.Tree.create();

        tree.setNode('foo>bar'.toPath(), {
            hello: 'world'
        });

        strictEqual(tree.appendNode('foo>bar'.toPath(), {
            hi: 'all'
        }, function (path, afterNode) {
            ok(path.equals('foo>bar'.toPath()), "should pass affected path to handler");
            deepEqual(afterNode, {
                hello: 'world',
                hi   : 'all'
            }, "should pass after node to handler");
        }), tree, "should be chainable");

        deepEqual(tree.items, {
            foo: {
                bar: {
                    hello: 'world',
                    hi   : 'all'
                }
            }
        }, "should append node");

        tree.appendNode('foo>bar'.toPath(), {
            hi: 'all'
        }, function () {
            ok(false, "should NOT invoke handler on appending identical key-value pairs");
        });
    });

    test("Appending array to array", function () {
        expect(3);

        var tree = sntls.Tree.create()
            .setNode('foo>bar'.toPath(), [ 'hello', 'world' ])
            .appendNode('foo>bar'.toPath(), [ 'hi', 'all' ], function (path, afterNode) {
                ok(path.equals('foo>bar'.toPath()), "should pass affected path to handler");
                deepEqual(afterNode, [ 'hello', 'world', 'hi', 'all' ],
                    "should pass after node to handler");
            });

        deepEqual(tree.items, {
            foo: {
                bar: [ 'hello', 'world', 'hi', 'all' ]
            }
        }, "should concatenate specified value node");

        tree.appendNode('foo>bar'.toPath(), [], function () {
            ok(false, "should NOT invoke handler on empty array");
        });
    });

    test("Appending object to array", function () {
        expect(3);

        var tree = sntls.Tree.create()
            .setNode('foo>bar'.toPath(), [ 'hello', 'world' ])
            .appendNode('foo>bar'.toPath(), {
                'hi': 'all'
            }, function (path, afterNode) {
                ok(path.equals('foo>bar'.toPath()), "should pass affected path to handler");
                deepEqual(afterNode, [ 'hello', 'world', {'hi': 'all'} ],
                    "should pass after node to handler");
            });

        deepEqual(tree.items, {
            foo: {
                bar: [ 'hello', 'world', {'hi': 'all'} ]
            }
        }, "should push specified value to node");
    });

    test("Appending value to primitive", function () {
        expect(3);

        var tree = sntls.Tree.create()
            .setNode('foo>bar'.toPath(), 'hello')
            .appendNode('foo>bar'.toPath(), 'hi', function (path, afterNode) {
                ok(path.equals('foo>bar'.toPath()), "should pass affected path to handler");
                equal(afterNode, 'hi', "should pass after node to handler");
            });

        deepEqual(tree.items, {
            foo: {
                bar: 'hi'
            }
        }, "should replace primitive node");

        tree.appendNode('foo>bar'.toPath(), 'hi', function () {
            ok(false, "should NOT invoke handler on appending identical value");
        });
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

        tree.unsetNode([].toPath());

        deepEqual(tree.items, {}, "Root node annulled");
    });

    test("Key deletion from object", function () {
        expect(4);

        var tree = sntls.Tree.create({
            foo: {
                bar: "Hello world!"
            }
        });

        strictEqual(tree.unsetKey('foo>bar'.toPath(), false, function (path, value) {
            equal(path.toString(), 'foo', "should pass affected path to handler");
            deepEqual(value, {}, "should pass parent node (after) to handler");
        }), tree, "should be chainable");
        deepEqual(tree.items, {foo: {}}, "should remove specified key");

        tree.unsetKey('foo>bar'.toPath(), false, function () {
            ok(false, "should NOT invoke handler for absent key");
        });
    });

    test("Key-deleting entire tree", function () {
        expect(3);

        var tree = sntls.Tree.create({
            foo: {
                bar: "Hello world!"
            }
        });

        tree.unsetKey([].toPath(), false, function (path, value) {
            deepEqual(path.asArray, [], "should pass empty path to handler");
            strictEqual(value, tree.items, "should pass tree buffer as value");
        });

        deepEqual(tree.items, {}, "should set buffer to empty object");

        tree.unsetKey([].toPath(), false, function () {
            ok(false, "should NOT invoke handler for buffer that's already empty");
        });
    });

    test("Key deletion from array", function () {
        var tree = sntls.Tree.create({
            foo: {
                bar: ['hello', 'all', 'the', 'world']
            }
        });

        tree.unsetKey('foo>bar>2'.toPath(), false);
        deepEqual(tree.items, {
            foo: {
                bar: ['hello', 'all', undefined, 'world']
            }
        }, "should delete specified node when splice argument is false");

        tree.unsetKey('foo>bar>2'.toPath(), true);
        deepEqual(tree.items, {
            foo: {
                bar: ['hello', 'all', 'world']
            }
        }, "should splice node out when splice argument is true");
    });

    test("Path deletion in objects", function () {
        expect(12);

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
        });

        tree.unsetPath('foo>bar>baz'.toPath());
        deepEqual(tree.items, {
            a: {d: {}, e: {}, f: {
                g: {}, h: {
                    i: {j: {k: {l: {
                        n: {o: "p"}
                    }, m         : {}}}}
                }
            }},
            b: {},
            c: {}
        }, "should leave contents intact when attempting to delete an absent path");

        tree.unsetPath('a>f>foo>bar'.toPath());
        deepEqual(tree.items, {
            a: {d: {}, e: {}, f: {
                g: {}, h: {
                    i: {j: {k: {l: {
                        n: {o: "p"}
                    }, m         : {}}}}
                }
            }},
            b: {},
            c: {}
        }, "should leave contents intact when attempting to delete a partially absent path");

        strictEqual(tree.unsetPath('a>f>h>i>j>k>l>n>o'.toPath()), tree, "should be chainable");

        deepEqual(tree.items, {
            a: {d: {}, e: {}, f: {
                g: {}, h: {
                    i: {j: {k: {m: {}}}}
                }
            }},
            b: {},
            c: {}
        }, "should remove specified path");

        tree.unsetPath('a>f>h>i>j>k>m'.toPath(), false, function (path, value) {
            equal(path.toString(), 'a>f>h', "should pass affected path to handler");
            equal(typeof value, 'undefined', "should pass affected value to handler");
        });

        deepEqual(tree.items, {
            a: {d: {}, e: {}, f: {
                g: {}
            }},
            b: {},
            c: {}
        }, "should remove specified path");

        tree.unsetPath('a>f>g'.toPath());

        deepEqual(tree.items, {
            a: {d: {}, e: {}},
            b: {},
            c: {}
        }, "should remove specified path");

        tree.unsetPath('b'.toPath());
        deepEqual(tree.items, {
            a: {d: {}, e: {}},
            c: {}
        }, "should remove path ending in non-singular node");

        tree.unsetPath('a>e>foo'.toPath());
        deepEqual(tree.items, {
            a: {d: {}, e: {}},
            c: {}
        }, "should not remove overreaching node");

        tree
            .unsetPath('c'.toPath())
            .unsetPath('a>d'.toPath());

        deepEqual(tree.items, {a: {e: {}}}, "should remove specified path");

        tree.unsetPath('a>e'.toPath());
        deepEqual(tree.items, {}, "should empty node after removing last remaining path");
    });

    test("Path deletion w/ empty path", function () {
        expect(2);

        var tree = sntls.Tree.create({
            foo: {
                bar: "Hello world!"
            }
        });

        tree.unsetPath([].toPath(), false, function (path) {
            deepEqual(path.asArray, [], "Affected path");
        });

        deepEqual(tree.items, {}, "Tree completely emptied");
    });

    test("Path deletion in arrays", function () {
        expect(12);

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

        tree
            .unsetPath([1].toPath(), true)
            .unsetPath([0, 0].toPath(), true)
            .unsetPath([0, 0].toPath(), true);
        deepEqual(
            tree.items,
            [
                [3]
            ],
            "Almost empty"
        );

        tree
            .unsetPath([0, 0].toPath(), true);
        deepEqual(
            tree.items,
            [],
            "Tree completely emptied"
        );
    });

    test("Moving node", function () {
        var tree;

        function getTree() {
            return sntls.Tree.create({
                foo: {
                    bar: "Hello world!"
                }
            });
        }

        tree = getTree();
        tree.moveNode('foo'.toPath(), 'baz'.toPath());
        deepEqual(tree.items, {
            foo: undefined,
            baz: {
                bar: "Hello world!"
            }
        }, "Moved to sibling node");

        tree = getTree();
        tree.moveNode('foo'.toPath(), 'foo>baz'.toPath());
        deepEqual(tree.items, {
            foo: {
                baz: {
                    bar: "Hello world!"
                }
            }
        }, "Moved to inner node");

        tree = getTree();
        tree.moveNode([].toPath(), 'documents>baz'.toPath());
        deepEqual(tree.items, {
            documents: {
                baz: {
                    foo: {
                        bar: "Hello world!"
                    }
                }
            }
        }, "Root moved to inner node");
    });

    test("Recursive traversal", function () {
        expect(3);

        var tree = sntls.Tree.create({}),
            handler = function () {
            };

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
            handler = function () {
            };

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
            tree.queryKeysAsHash('foo>baz>\\>"'.toQuery()).items,
            ["1", "3", "foo"],
            "Keys queried w/ skipper as last pattern"
        );

        deepEqual(
            tree.queryPathsAsHash('foo>baz>\\>"'.toQuery())
                .toCollection()
                .mapValues(function (item) {
                    return item.toString();
                })
                .getValues(),
            ["foo>baz>1", "foo>baz>3", "foo>baz>2>foo"],
            "Paths queried"
        );

        deepEqual(
            tree.queryKeyValuePairsAsHash('foo>baz>\\>"'.toQuery()).items,
            {
                1  : 1,
                foo: "bar",
                3  : 3
            },
            "Key-value pairs queried"
        );

        deepEqual(
            tree.queryPathValuePairsAsHash('foo>baz>\\>"'.toQuery()).items,
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
