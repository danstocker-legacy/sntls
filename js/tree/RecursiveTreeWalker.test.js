/*global sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    var node = {
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
    };

    module("Recursive Tree Walker");

    test("Instantiation", function () {
        function handler() {}

        var query = 'foo>\\>bar'.toQuery(),
            walker;

        raises(function () {
            sntls.RecursiveTreeWalker.create(handler, 'foo');
        }, "should raise exception on invalid query");

        walker = /** @type {sntls.RecursiveTreeWalker} */ sntls.RecursiveTreeWalker.create(handler, query);
        strictEqual(walker.query, query, "should set query property");
        strictEqual(walker.handler, handler, "should set handler property");

        // TODO: Revisit this. Is this necessary?
        walker = /** @type {sntls.RecursiveTreeWalker} */ sntls.RecursiveTreeWalker.create(handler);
        equal(walker.query.toString(), '\\', "should set skipper as default query");
    });

    test("Gathering indices by value from Array", function () {
        var allIndicesOf = sntls.RecursiveTreeWalker._allIndicesOf;

        deepEqual(
            allIndicesOf(['foo', 'bar', 1, 2, 'foo', 3], 'baz'),
            {},
            "should yield empty object on no match"
        );

        deepEqual(
            allIndicesOf(['foo', 'bar', 1, 2, 'foo', 3], 'foo'),
            { 0: true, 4: true },
            "should include matching indices in result"
        );
    });

    test("Gathering matching keys from Object", function () {
        var getKeysByValue = sntls.RecursiveTreeWalker._getKeysByValue;

        deepEqual(
            getKeysByValue({ foo: 1, bar: 2, baz: 3 }, 4),
            {},
            "should return empty object on no matching keys"
        );

        deepEqual(
            getKeysByValue({ foo: 1, bar: 2, baz: 3, hello: 1, world: 2 }, 1),
            {foo: true, hello: true},
            "should include keys for matching values"
        );
    });

    test("Gathering object properties from Object", function () {
        var getKeysForObjectProperties = sntls.RecursiveTreeWalker._getKeysForObjectProperties;

        deepEqual(
            getKeysForObjectProperties({ foo: 1, bar: 2, baz: 3 }),
            {},
            "should return empty object when there are no object type properties"
        );

        deepEqual(
            getKeysForObjectProperties({ foo: {}, bar: 2, baz: {} }),
            {foo: true, baz: true},
            "should include all keys for object type properties in result"
        );

        deepEqual(
            getKeysForObjectProperties([
                {},
                'foo',
                1,
                2,
                [],
                'bar'
            ]),
            {0: true, 4: true},
            "should include all suitable indices from Array type container"
        );
    });

    test("Gathering keys matching a key-value pattern", function () {
        var RecursiveTreeWalker = sntls.RecursiveTreeWalker,
            hashNode = {
                foo  : 'bar',
                hello: 'world',
                test : 1
            },
            arrayNode = [
                'world',
                'bar',
                1,
                'world'
            ];

        deepEqual(
            RecursiveTreeWalker._getKeysByPattern(hashNode, '|'.toKVP()),
            hashNode,
            "should return input node for wildcard"
        );
        deepEqual(
            RecursiveTreeWalker._getKeysByPattern(hashNode, 'blah'.toKVP()),
            {},
            "should return empty object for literal key not in node"
        );
        deepEqual(
            RecursiveTreeWalker._getKeysByPattern(hashNode, 'foo<bar'.toKVP()),
            {foo: true},
            "should include keys matching any of the options"
        );
        deepEqual(
            RecursiveTreeWalker._getKeysByPattern(hashNode, '|^world'.toKVP()),
            {hello: true},
            "should include keys matching wildcard w/ literal value"
        );
        deepEqual(
            RecursiveTreeWalker._getKeysByPattern(hashNode, 'hello^world'.toKVP()),
            {hello: true},
            "should include single key matching literal key w/ literal value"
        );
        deepEqual(
            RecursiveTreeWalker._getKeysByPattern(hashNode, 'hello<foo^world'.toKVP()),
            {hello: true},
            "should include keys matching option w/ literal value"
        );

        deepEqual(
            RecursiveTreeWalker._getKeysByPattern(arrayNode, '|'.toKVP().setValue(1)),
            {2: true},
            "should include Array positions for wildcard w/ numeric value"
        );
        deepEqual(
            RecursiveTreeWalker._getKeysByPattern(arrayNode, '|^world'.toKVP()),
            {0: true, 3: true},
            "should include Array positions for wildcard w/ string literal value"
        );
    });

    test("Walking tree with wildcard", function () {
        var result = [],
            handler = function (node) {
                result.push(node);
            };

        result = [];
        sntls.RecursiveTreeWalker.create(handler, 'foo>|>2'.toQuery()).walk(node);
        deepEqual(
            result,
            ["woohoo", 3, {foo: "bar"}],
            "should hit nodes matching query"
        );
    });

    test("Walking tree with skipping until key", function () {
        var result = [],
            handler = function (node) {
                result.push(node);
            };

        sntls.RecursiveTreeWalker.create(handler, '\\>2'.toQuery()).walk(node);
        deepEqual(
            result,
            ["woohoo", 3, {foo: "bar"}, "what"],
            "should hit nodes matching query"
        );
    });

    test("Walking tree with root node, skipping, then key", function () {
        var result = [],
            handler = function (node) {
                result.push(node);
            };

        sntls.RecursiveTreeWalker.create(handler, 'foo>\\>foo'.toQuery()).walk(node);
        deepEqual(result, ["bar"], "should hit nodes matching query");
    });

    test("Walking tree with skipping at end", function () {
        var result = [],
            handler = function (node) {
                result.push(node);
            };

        sntls.RecursiveTreeWalker.create(handler, 'foo>baz>\\'.toQuery()).walk(node);
        deepEqual(
            result,
            [
                {1: 1, 2: {foo: "bar"}, 3: 3}
            ],
            "should hit nodes matching query up until skipper"
        );
    });

    test("Walking entire tree", function () {
        var result = [],
            handler = function (node) {
                result.push(node);
            };

        sntls.RecursiveTreeWalker.create(handler).walk(node);
        deepEqual(result, [node], "should hit root node only");
    });

    test("Walking tree with skipping until value match", function () {
        var result = [],
            handler = function (node) {
                result.push(node);
            };
        sntls.RecursiveTreeWalker.create(
            handler,
            ['\\'.toKeyValuePattern(), '|'.toKeyValuePattern().setValue(3)].toQuery()).walk(node);
        deepEqual(result, [3, 3], "should hit nodes matching query");
    });

    test("Walking tree with multiple skipping", function () {
        var node = {
                1: {
                    x: 'bar',
                    a: {
                        b: {
                            2: {
                                c: {
                                    d: {
                                        x: 'hello'
                                    }
                                }
                            }
                        }
                    },
                    2: {
                        e: {
                            x: 'world'
                        }
                    },
                    f: {
                        g: {
                            h: {
                                x: 'baz',
                                i: {
                                    2: {
                                        j: {
                                            k: {
                                                x: 'foo'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            result = [],
            handler = function (node) {
                result.push(node);
            };

        sntls.RecursiveTreeWalker.create(handler, '\\>1>\\>2>\\>x'.toQuery()).walk(node);
        deepEqual(result, ['world', 'hello', 'foo'], "should hit nodes matching query");
    });

    test("Walking w/ value match", function () {
        var node = {
                foo  : "bar",
                hello: [
                    "world",
                    "all",
                    "bar"
                ],
                its  : {
                    not: "all",
                    baz: ["bar", "foo", "bar"],
                    foo: ["bar"]
                }
            },
            result = [],
            handler = function () {
                result.push(this.currentPath.toString());
            };

        result = [];
        sntls.RecursiveTreeWalker.create(handler, '\\>|^all'.toQuery()).walk(node);
        deepEqual(result, [ 'hello>1', 'its>not' ], "should hit nodes with specified value");

        result = [];
        sntls.RecursiveTreeWalker.create(handler, '\\>|^bar'.toQuery()).walk(node);
        deepEqual(result, [
            'foo',
            'hello>2',
            'its>baz>0',
            'its>baz>2',
            'its>foo>0'
        ], "should hit matching node at root level");
    });

    test("Walking query with complex value in query", function () {
        var value = {
                foo: "bar"
            },
            node = {
                foo: { hello: "world", bar: value },
                baz: [ 'one', value, 'two' ]
            },
            result,
            handler = function () {
                result.push(this.currentPath.toString());
            };

        result = [];
        sntls.RecursiveTreeWalker.create(handler, ['\\'.toKVP(), '|'.toKVP().setValue(value)].toQuery()).walk(node);
        deepEqual(result, [ 'foo>bar', 'baz>1' ], "should hit matching paths");
    });

    test("Traversal termination", function () {
        var node = {
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
                    1   : "hi",
                    2   : "what",
                    says: "cow"
                }
            },
            result = [],
            handler = function (node) {
                result.push(node);

                if (node === 1) {
                    return false;
                }
            };

        sntls.RecursiveTreeWalker.create(handler, '\\>1'.toQuery()).walk(node);
        deepEqual(result, ["hello again", 1], "should stop traversal where handler returned false");
    });

    test("Walking with marked node", function () {
        var node = {
                foo: {
                    a: 'hello',
                    b: 'world',
                    c: 'foo',
                    d: 'hello',
                    e: 'hello',
                    f: 'hello'
                },
                bar: {
                    b: 'hello',
                    a: 'bar',
                    c: 'earth',
                    z: 'hello'
                },
                baz: {
                    c: 3,
                    d: 5
                }
            },
            paths = [],
            values = [],
            handler = function (node) {
                values.push(node);
                paths.push(this.currentPath.toString());
            };

        paths = [];
        values = [];
        sntls.RecursiveTreeWalker.create(handler, '{|}>|^hello'.toQuery())
            .walk(node);
        deepEqual(
            paths.sort(),
            [
                'foo',
                'bar'
            ].sort(),
            "All marked paths collected"
        );
        deepEqual(
            values,
            [
                {
                    a: 'hello',
                    b: 'world',
                    c: 'foo',
                    d: 'hello',
                    e: 'hello',
                    f: 'hello'
                },
                {
                    b: 'hello',
                    a: 'bar',
                    c: 'earth',
                    z: 'hello'
                }
            ],
            "All marked nodes collected"
        );

        paths = [];
        sntls.RecursiveTreeWalker.create(handler, '|>{|^hello}'.toQuery())
            .walk(node);
        deepEqual(
            paths.sort(),
            [
                'foo>a',
                'foo>d',
                'foo>e',
                'foo>f',
                'bar>b',
                'bar>z'
            ].sort(),
            "All marked (leaf) nodes collected"
        );
    });

    test("Walking with multiple marked nodes", function () {
        var node = {
                foo: {
                    one  : {
                        a: 'hello',
                        b: 'world'
                    },
                    two  : {
                        c: 'foo',
                        d: 'hello',
                        e: 'hello'
                    },
                    three: {
                        f: 'hello'
                    }
                },
                bar: {
                    one: {
                        b: 'hello'
                    },
                    two: {
                        a: 'bar',
                        c: 'earth',
                        z: 'hello'
                    }
                },
                baz: {
                    c: 3,
                    d: 5
                }
            },
            result = [],
            handler = function () {
                result.push(this.currentPath.toString());
            };

        result = [];
        sntls.RecursiveTreeWalker.create(handler, '{|}>|>|^hello'.toQuery())
            .walk(node);
        deepEqual(
            result.sort(),
            [
                "foo",
                "bar"
            ].sort(),
            "higher nodes collected"
        );

        result = [];
        sntls.RecursiveTreeWalker.create(handler, '|>{|}>|^hello'.toQuery())
            .walk(node);
        deepEqual(
            result.sort(),
            [
                "foo>one",
                "foo>two",
                "foo>three",
                "bar>one",
                "bar>two"
            ].sort(),
            "higher nodes collected"
        );

        result = [];
        sntls.RecursiveTreeWalker.create(handler, '{|}>{|}>|^hello'.toQuery())
            .walk(node);
        deepEqual(
            result.sort(),
            [
                "foo>one",
                "foo>two",
                "foo>three",
                "foo",
                "bar>one",
                "bar>two",
                "bar"
            ].sort(),
            "All marked nodes collected"
        );
    });

    test("Taking snapshot of traversal state", function () {
        var node = {
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
            },
            result,
            handler = function () {
                result.push([this.currentKey, this.currentNode, this.currentPath.clone().asArray]);
            };

        result = [];
        sntls.RecursiveTreeWalker.create(handler, '\\>2'.toQuery()).walk(node);
        deepEqual(
            result,
            [
                ["2", "woohoo", ["foo", "bar", "2"]],
                ["2", 3, ["foo", "boo", "2"]],
                ["2", {"foo": "bar"}, ["foo", "baz", "2"]],
                ["2", "what", ["moo", "2"]]
            ],
            "should include correct key, node, and path"
        );
    });
}());
