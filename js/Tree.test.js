/*global sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    module("Tree");

    test("Instantiation", function () {
        var tree,
            json = {foo: 'bar'};

        tree = sntls.Tree.create();
        deepEqual(tree.root, {}, "Empty root");

        tree = sntls.Tree.create(json);
        strictEqual(tree.root, json, "root initialized with custom value");
    });

    test("Node retrieval", function () {
        var tree = sntls.Tree.create({
            foo: {
                bar: "Hello world!"
            }
        });

        equal(tree.getNode('foo.bar'), "Hello world!", "Node retrieved");
        equal(typeof tree.getNode('hello.world'), 'undefined', "Attempted to retrieve non-existent node");
    });

    test("Node setting", function () {
        var tree = sntls.Tree.create(),
            result;

        result = tree.setNode('foo.bar', "Hello world!");

        strictEqual(result, tree, "Tree.setNode is chainable");
        deepEqual(
            tree.root,
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

        result = tree.getSafeNode('foo.bar', function () {
            return "Whatever";
        });

        equal(result, "Hello world!", "Node retrieved from existing path");

        result = tree.getSafeNode('hello.world', function () {
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

        result = tree.unsetNode('foo.bar');

        strictEqual(result, tree, "Tree.unsetNode is chainable");
        deepEqual(tree.root, {foo: {}}, "Node removed");
    });
}());
