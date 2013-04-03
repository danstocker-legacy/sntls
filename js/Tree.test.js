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
}());
