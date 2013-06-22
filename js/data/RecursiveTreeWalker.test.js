/*global sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Recursive Tree Walker");

    test("Instantiation", function () {
        function handler() {}

        var query = 'foo>\\>bar'.toQuery(),
            walker = /** @type {sntls.RecursiveTreeWalker} */ sntls.RecursiveTreeWalker.create(query, handler);

        strictEqual(walker.query, query, "Query added to instance");
        strictEqual(walker.handler, handler, "Handler added to instance");
    });

    test("Available keys", function () {
        var node = {
                foo  : 'bar',
                hello: 'world',
                test : 1
            },
            query = '|>blah>foo<bar'.toQuery();

        deepEqual(sntls.RecursiveTreeWalker.getKeysByPattern(node, query.asArray[0]), Object.keys(node), "Asterisk pattern");
        equal(sntls.RecursiveTreeWalker.getKeysByPattern(node, query.asArray[1]), [], "String pattern");
        equal(sntls.RecursiveTreeWalker.getKeysByPattern(node, query.asArray[2]), ['foo'], "Array pattern");
    });

    test("Recursive traversal", function () {
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
        sntls.RecursiveTreeWalker.create('foo>|>2'.toQuery(), handler)
            .walk(node);
        deepEqual(
            result,
            ["woohoo", 3, {foo: "bar"}],
            "Nodes collected"
        );

        result = [];
        sntls.RecursiveTreeWalker.create('\\>2'.toQuery(), handler)
            .walk(node);
        deepEqual(
            result,
            ["woohoo", 3, {foo: "bar"}, "what"],
            "Nodes collected w/ skip"
        );

        result = [];
        sntls.RecursiveTreeWalker.create('foo>\\>foo'.toQuery(), handler)
            .walk(node);
        deepEqual(
            result,
            ["bar"],
            "Nodes collected w/ skip"
        );

        result = [];
        sntls.RecursiveTreeWalker.create('foo>baz>\\'.toQuery(), handler)
            .walk(node);
        deepEqual(
            result,
            [1, "bar", 3],
            "Leaf nodes collected under path"
        );

        result = [];
        sntls.RecursiveTreeWalker.create('\\'.toQuery(), handler)
            .walk(node);
        deepEqual(
            result,
            ["world", "woohoo", "hello again", 3, 1, "bar", 3, "what", "cow"],
            "All leaf nodes collected"
        );
    });
}());
