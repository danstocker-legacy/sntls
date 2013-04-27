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

        equal(tree.getNode('foo.bar'.toPath()), "Hello world!", "Node retrieved");
        equal(typeof tree.getNode('hello.world'.toPath()), 'undefined', "Attempted to retrieve non-existent node");
    });

    test("Node setting", function () {
        var tree = sntls.Tree.create({}),
            result;

        result = tree.setNode('foo.bar'.toPath(), "Hello world!");

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

    test("Safe node retrieval", function () {
        var json = {
                foo: {
                    bar: "Hello world!"
                }
            },
            tree = sntls.Tree.create(json),
            result;

        result = tree.getSafeNode('foo.bar'.toPath(), function () {
            return "Whatever";
        });

        equal(result, "Hello world!", "Node retrieved from existing path");

        result = tree.getSafeNode('hello.world'.toPath(), function () {
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

    test("Node deletion", function () {
        var tree = sntls.Tree.create({
                foo: {
                    bar: "Hello world!"
                }
            }),
            result;

        result = tree.unsetNode('foo.bar'.toPath());

        strictEqual(result, tree, "Tree.unsetNode is chainable");
        deepEqual(tree.items, {foo: {}}, "Node removed");
    });
}());
