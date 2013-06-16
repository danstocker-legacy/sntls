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

    test("Safe node retrieval", function () {
        var json = {
                foo: {
                    bar: "Hello world!"
                }
            },
            tree = sntls.Tree.create(json),
            result;

        result = tree.getSafeNode('foo>bar'.toPath(), function () {
            return "Whatever";
        });

        equal(result, "Hello world!", "Node retrieved from existing path");

        result = tree.getSafeNode('hello>world'.toPath(), function () {
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

        result = tree.unsetNode('foo>bar'.toPath());

        strictEqual(result, tree, "Tree.unsetNode is chainable");
        deepEqual(tree.items, {foo: {}}, "Node removed");
    });

    test("Traversal", function () {
        var obj = {
                hello: "world",
                foo  : {
                    bar: "woohoo",
                    boo: {
                        1: "hello again"
                    }
                },
                moo  : {
                    says: "cow"
                }
            },
            tree = sntls.Tree.create(obj),
            keys, paths;

        keys = [];
        paths = [];

        tree.traverse([], function (path, key) {
            paths.push(path.join('.'));
            keys.push(key);
        });

        deepEqual(keys, [
            'hello',
            'bar',
            '1',
            'says'
        ], "Keys read during full traversal");
        deepEqual(paths, [
            'hello',
            'foo.bar',
            'foo.boo.1',
            'moo.says'
        ], "Paths traversed during unterminated traversal");

        keys = [];
        paths = [];

        // setting up traversal to stop at key '1'
        tree.traverse([], function (path, key) {
            paths.push(path.join('.'));
            if (key === '1') {
                return false;
            }
            return undefined;
        });

        deepEqual(paths, [
            'hello',
            'foo.bar',
            'foo.boo.1'
        ], "Paths traversed during terminated traversal");
    });

    test("Loop detection", function () {
        var obj = {
                hello: {
                    world: "Hello World!"
                }
            },
            tree = sntls.Tree.create(obj),
            paths;

        // creating direct loop
        obj.hello.all = obj;

        paths = [];
        tree.traverse([], function (path) {
            paths.push(path.join('.'));
        });

        deepEqual(paths, [
            'hello.world',
            'hello.all'
        ], "Paths traversed in object with direct loop");

        // removing loop
        delete obj.hello.all;

        // creating indirect (cross) loop
        obj.bello = {
            world: obj.hello
        };
        obj.hello.all = obj.bello;

        paths = [];
        tree.traverse([], function (path) {
            paths.push(path.join('.'));
        });

        deepEqual(paths, [
            'hello.world',
            'hello.all.world',
            'bello.world.world',
            'bello.world.all'
        ], "Paths traversed in object with direct loop");
    });

    test("Available keys", function () {
        var node = {
                foo  : 'bar',
                hello: 'world',
                test : 1
            },
            path = ['*', 'blah', ['foo', 'bar']];

        deepEqual(sntls.Tree._getAvailableKeys(node, path[0]), Object.keys(node), "Asterisk pattern");
        equal(sntls.Tree._getAvailableKeys(node, path[1]), ['blah'], "String pattern");
        equal(sntls.Tree._getAvailableKeys(node, path[2]), ['foo', 'bar'], "Array pattern");
    });

    test("Restricted traversal", function () {
        var obj = {
                hello: "world",
                foo  : {
                    bar: {
                        2: "woohoo"
                    },
                    boo: {
                        1: "hello again",
                        2: 3
                    }
                },
                moo  : {
                    says: "cow"
                }
            },
            tree = sntls.Tree.create(obj),
            paths;

        paths = [];
        tree.traverse(['foo', '*', '2'], function (path) {
            paths.push(path.join('.'));
        });

        deepEqual(paths, [
            'foo.bar.2',
            'foo.boo.2'
        ], "Paths traversed with query restriction");
    });
}());
