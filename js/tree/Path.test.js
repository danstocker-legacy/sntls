/*global sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Path");

    test("Instantiation", function () {
        raises(function () {
            sntls.Path.create();
        }, "should raise exception on missing argument");

        raises(function () {
            sntls.Path.create('foo');
        }, "should raise exception on invalid argument");

        var path = sntls.Path.create(['test', 'path', 'it', 'is']);

        deepEqual(path.asArray, ['test', 'path', 'it', 'is'], "should preserve string keys");
    });

    test("Conversion from string", function () {
        var path = 'test>path>hello>world'.toPath();

        ok(sntls.Path.isBaseOf(path), "should return Path instance");
        deepEqual(path.asArray, ['test', 'path', 'hello', 'world'], "should set path buffer");
        deepEqual('test%5E>path'.toPath().asArray, ['test^', 'path'], "should URI decode path keys");
    });

    test("Conversion from array", function () {
        var path = ['test', 'path', 'hello', 'world'].toPath();

        ok(sntls.Path.isBaseOf(path), "should return Path instance");
        deepEqual(path.asArray, ['test', 'path', 'hello', 'world'], "should set path buffer");
    });

    test("Last key retrieval", function () {
        var path = 'test>path>it>is'.toPath();
        equal(path.getLastKey(), 'is', "should return last key from path buffer");
    });

    test("Cloning", function () {
        var path = 'test>path>it>is'.toPath(),
            clonePath = path.clone();

        ok(clonePath.isA(sntls.Path), "should return Path instance");
        deepEqual(path.asArray, clonePath.asArray, "should copy path buffer");
        notStrictEqual(path, clonePath, "should return different Path instance than original");
        notStrictEqual(path.asArray, clonePath.asArray, "should set different path buffer than original");
    });

    test("Left trimming", function () {
        var originalPath = ['test', 'originalPath', 'it', 'is'].toPath(),
            trimmedPath = originalPath.trimLeft();

        strictEqual(originalPath, trimmedPath, "should return self");
        deepEqual(
            trimmedPath.asArray,
            ['originalPath', 'it', 'is'],
            "should remove leftmost key from path buffer when no count is specified");

        originalPath.trimLeft(2);
        deepEqual(
            originalPath.asArray,
            ['is'],
            "should remove specified number of keys from left");
    });

    test("Right trimming", function () {
        var originalPath = ['test', 'originalPath', 'it', 'is'].toPath(),
            trimmedPath = originalPath.trimRight();

        strictEqual(originalPath, trimmedPath, "should return self");
        deepEqual(
            trimmedPath.asArray,
            ['test', 'originalPath', 'it'],
            "should remove rightmost key from path buffer when no count is specified");

        originalPath.trimRight(2);
        deepEqual(
            originalPath.asArray,
            ['test'],
            "should remove specified number of keys from right");
    });

    test("Appending", function () {
        var originalPath = ['test', 'originalPath', 'it', 'is'].toPath(),
            appendedPath = originalPath.append('foo>bar'.toPath());

        strictEqual(originalPath, appendedPath, "should return self");
        deepEqual(
            appendedPath.asArray,
            ['test', 'originalPath', 'it', 'is', 'foo', 'bar'],
            "should append specified path");
    });

    test("Appending key", function () {
        var originalPath = ['test', 'originalPath', 'it', 'is'].toPath(),
            appendedPath = originalPath.appendKey('foo');

        strictEqual(originalPath, appendedPath, "should return self");
        deepEqual(
            appendedPath.asArray,
            ['test', 'originalPath', 'it', 'is', 'foo'],
            "should append specified key to path buffer");
    });

    test("Prepending", function () {
        var originalPath = ['test', 'originalPath', 'it', 'is'].toPath(),
            prependedPath = originalPath.prepend('foo>bar'.toPath());

        strictEqual(originalPath, prependedPath, "should return self");
        deepEqual(
            prependedPath.asArray,
            ['foo', 'bar', 'test', 'originalPath', 'it', 'is'],
            "should prepend specified path");
    });

    test("Prepending key", function () {
        var originalPath = ['test', 'originalPath', 'it', 'is'].toPath(),
            prependedPath = originalPath.prependKey('foo');

        strictEqual(originalPath, prependedPath, "should return self");
        deepEqual(
            prependedPath.asArray,
            ['foo', 'test', 'originalPath', 'it', 'is'],
            "should prepend specified key to path buffer");
    });

    test("Equality tester", function () {
        /** @type sntls.Path */
        var path = 'test>path>it>is'.toPath();

        ok(!path.equals(), "should return false on passing undefined");
        ok(!path.equals("string"), "should return false on passing non-Path instance");

        ok(path.equals('test>path>it>is'.toPath()), "should return true on matching Path");
        ok(!path.equals('path>it>is'.toPath()), "should return false on non-matching Path");
    });

    test("Relative path tester", function () {
        var root = 'test>path'.toPath(),
            path = 'test>path>it>is'.toPath();

        ok(path.isRelativeTo(root), "should return true on passing root path");
        ok(root.isRelativeTo(root.clone()), "should return true on passing self");
        ok(!root.isRelativeTo(path), "should return false on non-root path");
    });

    test("Root tester", function () {
        var root = 'test>path'.toPath(),
            path = 'test>path>it>is'.toPath();

        ok(root.isRootOf(root), "should return true on passing self");
        ok(root.isRootOf(path), "should return true on correct relative path");
        ok(!path.isRootOf(root), "should return false non-relative path");
    });

    test("Serialization", function () {
        var path;

        path = ['test', 'path', 'it', 'is'].toPath();
        equal(path.toString(), 'test>path>it>is', "should return path in string format");

        path = ['test>', 'path', 'it', 'is'].toPath();
        equal(path.toString(), 'test%3E>path>it>is', "should URI encode keys");
    });
}());
