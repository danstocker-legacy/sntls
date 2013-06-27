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
        deepEqual(
            sntls.RecursiveTreeWalker._allIndicesOf(['foo', 'bar', 1, 2, 'foo', 3], 'baz'),
            [],
            "0 hits"
        );

        deepEqual(
            sntls.RecursiveTreeWalker._allIndicesOf(['foo'], 'foo'),
            [0],
            "1 hit"
        );

        deepEqual(
            sntls.RecursiveTreeWalker._allIndicesOf(['foo', 'bar', 1, 2, 'foo', 3], 'foo'),
            [0, 4],
            "> 1 multiplicity"
        );
    });

    test("Key gathering from object", function () {
        deepEqual(
            sntls.RecursiveTreeWalker._getKeysByValue({
                foo: 1,
                bar: 2,
                baz: 3
            }, 4),
            [],
            "0 hits"
        );

        deepEqual(
            sntls.RecursiveTreeWalker._getKeysByValue({
                foo: 1}, 1),
            ['foo'],
            "1 hit"
        );

        deepEqual(
            sntls.RecursiveTreeWalker._getKeysByValue({
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

    test("Available keys", function () {
        var node = {
                foo  : 'bar',
                hello: 'world',
                test : 1
            },
            query = '|>blah>foo<bar>|^world'.toQuery();

        deepEqual(sntls.RecursiveTreeWalker.getKeysByPattern(node, query.asArray[0]), Object.keys(node), "Asterisk pattern");
        deepEqual(sntls.RecursiveTreeWalker.getKeysByPattern(node, query.asArray[1]), [], "String pattern");
        deepEqual(sntls.RecursiveTreeWalker.getKeysByPattern(node, query.asArray[2]), ['foo'], "Array pattern");
        deepEqual(sntls.RecursiveTreeWalker.getKeysByPattern(node, query.asArray[3]), ['hello'
        ], "Value pattern w/ object");
        deepEqual(sntls.RecursiveTreeWalker.getKeysByPattern(
            ['foo', 'hello', 'world', 'baz', 'world'],
            query.asArray[3]),
            [2, 4],
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
