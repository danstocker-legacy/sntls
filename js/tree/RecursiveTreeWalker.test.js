/*global sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Recursive Tree Walker");

    test("Instantiation", function () {
        function handler() {}

        var query = 'foo>\\>bar'.toQuery(),
            walker;

        raises(function () {
            sntls.RecursiveTreeWalker.create(handler, 'foo');
        }, "Invalid query");

        walker = /** @type {sntls.RecursiveTreeWalker} */ sntls.RecursiveTreeWalker.create(handler, query);
        strictEqual(walker.query, query, "Query added to instance");
        strictEqual(walker.handler, handler, "Handler added to instance");

        walker = /** @type {sntls.RecursiveTreeWalker} */ sntls.RecursiveTreeWalker.create(handler);
        equal(walker.query.toString(), '\\', "Full traversal query is default");
    });

    test("Index gathering from array", function () {
        var allIndicesOf = sntls.RecursiveTreeWalker._allIndicesOf;

        deepEqual(
            allIndicesOf(['foo', 'bar', 1, 2, 'foo', 3], 'baz'),
            [],
            "0 hits"
        );

        deepEqual(
            allIndicesOf(['foo'], 'foo'),
            [0],
            "1 hit"
        );

        deepEqual(
            allIndicesOf(['foo', 'bar', 1, 2, 'foo', 3], 'foo'),
            [0, 4],
            "> 1 multiplicity"
        );

        deepEqual(
            allIndicesOf(['foo', 'bar', 'foo', 'baz', 'foo'], 'foo'),
            [0, 2, 4],
            "> 1 multiplicity"
        );
    });

    test("Key gathering from object", function () {
        var getKeysByValue = sntls.RecursiveTreeWalker._getKeysByValue;

        deepEqual(
            getKeysByValue({
                foo: 1,
                bar: 2,
                baz: 3
            }, 4),
            [],
            "0 hits"
        );

        deepEqual(
            getKeysByValue({
                foo: 1}, 1),
            ['foo'],
            "1 hit"
        );

        deepEqual(
            getKeysByValue({
                foo  : 1,
                bar  : 2,
                baz  : 3,
                hello: 1,
                world: 2
            }, 1),
            ['foo', 'hello'],
            "> 1 multiplicity"
        );
    });

    test("Key gathering for object values", function () {
        var getKeysForObjectProperties = sntls.RecursiveTreeWalker._getKeysForObjectProperties;

        deepEqual(
            getKeysForObjectProperties({
                foo: 1,
                bar: 2,
                baz: 3
            }),
            [],
            "No objects"
        );

        deepEqual(
            getKeysForObjectProperties({
                foo: {},
                bar: 2,
                baz: 3
            }),
            ['foo'],
            "Single hit"
        );

        deepEqual(
            getKeysForObjectProperties({
                foo: {},
                bar: 2,
                baz: {}
            }),
            ['foo', 'baz'],
            "Multiple hits"
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
            ['0', '4'],
            "Multiple hits in array"
        );
    });

    test("Available keys", function () {
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
            RecursiveTreeWalker.getKeysByPattern(hashNode, '|'.toQueryPattern()),
            Object.keys(hashNode),
            "Wildcard pattern"
        );
        deepEqual(
            RecursiveTreeWalker.getKeysByPattern(hashNode, 'blah'.toQueryPattern()),
            [],
            "String pattern"
        );
        deepEqual(
            RecursiveTreeWalker.getKeysByPattern(hashNode, 'foo<bar'.toQueryPattern()),
            ['foo'],
            "Array pattern"
        );
        deepEqual(
            RecursiveTreeWalker.getKeysByPattern(hashNode, '|^world'.toQueryPattern()),
            ['hello'],
            "Value pattern w/ object"
        );
        deepEqual(
            RecursiveTreeWalker.getKeysByPattern(hashNode, 'hello^world'.toQueryPattern()),
            ['hello'],
            "Value pattern w/ object"
        );
        deepEqual(
            RecursiveTreeWalker.getKeysByPattern(hashNode, 'hello<foo^world'.toQueryPattern()),
            ['hello'],
            "Value pattern w/ object"
        );

        deepEqual(
            RecursiveTreeWalker.getKeysByPattern(arrayNode, sntls.QueryPattern.create({symbol: '|', value: 1})),
            [2],
            "Value pattern w/ array"
        );
        deepEqual(
            RecursiveTreeWalker.getKeysByPattern(arrayNode, '|^world'.toQueryPattern()),
            [0, 3],
            "Value pattern w/ array"
        );
    });

    test("Walking", function () {
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
            result = [],
            handler = function (node) {
                result.push(node);
            };

        result = [];
        sntls.RecursiveTreeWalker.create(handler, 'foo>|>2'.toQuery())
            .walk(node);
        deepEqual(
            result,
            ["woohoo", 3, {foo: "bar"}],
            "Nodes collected"
        );

        result = [];
        sntls.RecursiveTreeWalker.create(handler, '\\>2'.toQuery())
            .walk(node);
        deepEqual(
            result,
            ["woohoo", 3, {foo: "bar"}, "what"],
            "Nodes collected w/ skip"
        );

        result = [];
        sntls.RecursiveTreeWalker.create(handler, 'foo>\\>foo'.toQuery())
            .walk(node);
        deepEqual(
            result,
            ["bar"],
            "Nodes collected w/ skip"
        );

        result = [];
        sntls.RecursiveTreeWalker.create(handler, 'foo>baz>\\'.toQuery())
            .walk(node);
        deepEqual(
            result,
            [1, "bar", 3],
            "Leaf nodes collected under path"
        );

        result = [];
        sntls.RecursiveTreeWalker.create(handler)
            .walk(node);
        deepEqual(
            result,
            ["world", "woohoo", "hello again", 3, 1, "bar", 3, "what", "cow"],
            "All leaf nodes collected"
        );

        result = [];
        sntls.RecursiveTreeWalker.create(handler, ['\\', {symbol: '|', value: 3}].toQuery())
            .walk(node);
        deepEqual(
            result,
            [3, 3],
            "Leaf nodes matching value"
        );
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
        sntls.RecursiveTreeWalker.create(handler, '\\>|^all'.toQuery())
            .walk(node);
        deepEqual(
            result,
            [
                'hello>1',
                'its>not'
            ],
            "Paths with value 'all'"
        );

        result = [];
        sntls.RecursiveTreeWalker.create(handler, '\\>|^bar'.toQuery())
            .walk(node);
        deepEqual(
            result,
            [
                'hello>2',
                'its>baz>0',
                'its>baz>2',
                'its>foo>0'
            ],
            "Paths with value 'bar'"
        );
    });

    test("Walking query with complex value in query", function () {
        var value = {
                foo: "bar"
            },
            node = {
                foo: { hello: "world", bar: value },
                baz: [ 'one', value, 'two' ],
                bar: value
            },
            result,
            handler = function () {
                result.push(this.currentPath.toString());
            };

        result = [];
        sntls.RecursiveTreeWalker.create(handler, [
                '\\'.toQueryPattern(),
                sntls.QueryPattern.create({
                    symbol: '|',
                    value : value
                })
            ].toQuery())
            .walk(node);

        deepEqual(
            result,
            [
                'foo>bar',
                'baz>1'
            ],
            "Paths with value 'bar'"
        );
    });

    test("Walking with interrupt", function () {
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
            result = [],
            handler = function (node) {
                result.push(node);

                if (node === 3) {
                    return false;
                }
            };

        result = [];
        sntls.RecursiveTreeWalker.create(handler)
            .walk(node);
        deepEqual(
            result,
            ["world", "woohoo", "hello again", 3],
            "All leaf nodes collected"
        );
    });

    test("Walking state", function () {
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
        sntls.RecursiveTreeWalker.create(handler, '\\>2'.toQuery())
            .walk(node);
        deepEqual(
            result,
            [
                ["2", "woohoo", ["foo", "bar", "2"]],
                ["2", 3, ["foo", "boo", "2"]],
                ["2", {"foo": "bar"}, ["foo", "baz", "2"]],
                ["2", "what", ["moo", "2"]]
            ],
            "Traversed keys, nodes, paths"
        );

        result = [];
        sntls.RecursiveTreeWalker.create(handler, ['\\', {symbol: '|', value: 3}].toQuery())
            .walk(node);
        deepEqual(
            result,
            [
                ["2", 3, ["foo", "boo", "2"]],
                ["3", 3, ["foo", "baz", "3"]]
            ],
            "Traversed keys, nodes, paths"
        );

        result = [];
        sntls.RecursiveTreeWalker.create(handler)
            .walk(node);
        deepEqual(
            result,
            [
                ["hello", "world", ["hello"]],
                ["2", "woohoo", ["foo", "bar", "2"]],
                ["1", "hello again", ["foo", "boo", "1"]],
                ["2", 3, ["foo", "boo", "2"]],
                ["1", 1, ["foo", "baz", "1"]],
                ["foo", "bar", ["foo", "baz", "2", "foo"]],
                ["3", 3, ["foo", "baz", "3"]],
                ["2", "what", ["moo", "2"]],
                ["says", "cow", ["moo", "says"]]
            ],
            "Traversed keys, nodes, paths"
        );
    });
}());
