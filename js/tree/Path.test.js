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
    });

    test("Conversion from array", function () {
        var path = ['test', 'path', 'hello', 'world'].toPath();

        ok(sntls.Path.isBaseOf(path), "should return Path instance");
        deepEqual(path.asArray, ['test', 'path', 'hello', 'world'], "should set path buffer");
    });

    test("Key retrieval", function () {
        var path = 'test>path>it>is'.toPath();
        equal(path.getLastKey(), 'is', "Last key");
    });

    test("Serialization", function () {
        var path;

        path = ['test', 'path', 'it', 'is'].toPath();
        equal(path.toString(), 'test>path>it>is', "Serialized path");

        path = ['test>', 'path', 'it', 'is'].toPath();
        equal(path.toString(), 'test%3E>path>it>is', "Serialized path");
    });

    test("Cloning", function () {
        var path = 'test>path>it>is'.toPath(),
            clonePath = path.clone();

        deepEqual(path.asArray, clonePath.asArray, "Path buffers represent the same path");
        notStrictEqual(path, clonePath, "Clone is different from original");
        notStrictEqual(path.asArray, clonePath.asArray, "Clone's buffer is different from original");
    });

    test("Left trimming", function () {
        var originalPath = ['test', 'originalPath', 'it', 'is'].toPath(),
            trimmedPath = originalPath.trimLeft();

        strictEqual(originalPath, trimmedPath, "Trimming returns new Path");
        deepEqual(
            trimmedPath.asArray,
            ['originalPath', 'it', 'is'],
            "Trimmed path"
        );

        originalPath.trimLeft(2);
        deepEqual(
            originalPath.asArray,
            ['is'],
            "Trimmed multiple keys"
        );
    });

    test("Right trimming", function () {
        var originalPath = ['test', 'originalPath', 'it', 'is'].toPath(),
            trimmedPath = originalPath.trimRight();

        strictEqual(originalPath, trimmedPath, "Trimming returns new Path");
        deepEqual(
            trimmedPath.asArray,
            ['test', 'originalPath', 'it'],
            "Trimmed path"
        );

        originalPath.trimRight(2);
        deepEqual(
            originalPath.asArray,
            ['test'],
            "Trimmed multiple keys"
        );
    });

    test("Appending", function () {
        var originalPath = ['test', 'originalPath', 'it', 'is'].toPath(),
            appendedPath = originalPath.append('foo>bar'.toPath());

        strictEqual(originalPath, appendedPath, "Appending returns new Path");

        deepEqual(
            appendedPath.asArray,
            ['test', 'originalPath', 'it', 'is', 'foo', 'bar'],
            "Appended path"
        );
    });

    test("Appending key", function () {
        var originalPath = ['test', 'originalPath', 'it', 'is'].toPath(),
            appendedPath = originalPath.appendKey('foo');

        strictEqual(originalPath, appendedPath, "Appending returns new Path");

        deepEqual(
            appendedPath.asArray,
            ['test', 'originalPath', 'it', 'is', 'foo'],
            "Appended path"
        );
    });

    test("Prepending", function () {
        var originalPath = ['test', 'originalPath', 'it', 'is'].toPath(),
            prependedPath = originalPath.prepend('foo>bar'.toPath());

        strictEqual(originalPath, prependedPath, "Prepending returns new Path");

        deepEqual(
            prependedPath.asArray,
            ['foo', 'bar', 'test', 'originalPath', 'it', 'is'],
            "Prepended path"
        );
    });

    test("Prepending key", function () {
        var originalPath = ['test', 'originalPath', 'it', 'is'].toPath(),
            prependedPath = originalPath.prependKey('foo');

        strictEqual(originalPath, prependedPath, "Prepending returns new Path");

        deepEqual(
            prependedPath.asArray,
            ['foo', 'test', 'originalPath', 'it', 'is'],
            "Prepended path"
        );
    });

    test("Equality", function () {
        /** @type sntls.Path */
        var path = 'test>path>it>is'.toPath();

        ok(!path.equals(), "Not equal to undefined");
        ok(!path.equals("string"), "Not equal to string");

        ok(path.equals('test>path>it>is'.toPath()), "Matching path");
        ok(!path.equals('path>it>is'.toPath()), "Non-matching path");

        ok(path.equals('test>path>it>is'.toPath()), "Matching string path");
        ok(!path.equals('path>it>is'.toPath()), "Non-matching string path");

        ok(path.equals(['test', 'path', 'it', 'is'].toPath()), "Matching array path");
        ok(!path.equals(['path', 'it', 'is'].toPath()), "Non-matching array path");
    });

    test("Relative paths", function () {
        var root = 'test>path'.toPath(),
            path = 'test>path>it>is'.toPath();

        ok(path.isRelativeTo(root), "Path is relative to root");
        ok(root.isRelativeTo(root.clone()), "Root is relative to itself");
        ok(!root.isRelativeTo(path), "Root is not relative to path");
    });

    test("Root paths", function () {
        var root = 'test>path'.toPath(),
            path = 'test>path>it>is'.toPath();

        ok(root.isRootOf(root), "Path is root of itself");
        ok(root.isRootOf(path), "Path is root of relative path");
        ok(!path.isRootOf(root), "Path is not root of paths it's relative to");
    });
}());
