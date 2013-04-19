/*global sntls, module, test, expect, ok, equal, notStrictEqual, deepEqual, raises */
(function () {
    module("Path");

    test("Initialized by string", function () {
        var path = sntls.Path.create('test.path.it.is');
        deepEqual(path.asArray, ['test', 'path', 'it', 'is'], "Array representation");
    });

    test("Initialized by array", function () {
        var path = sntls.Path.create(['test', 'path', 'it', 'is']);
        deepEqual(path.asArray, ['test', 'path', 'it', 'is'], "Array representation");
    });

    test("Serialization", function () {
        var path = sntls.Path.create(['test', 'path', 'it', 'is']);
        equal(path.toString(), 'test.path.it.is', "Serialized path");
    });

    test("Cloning", function () {
        var path = sntls.Path.create('test.path.it.is'),
            clonePath = path.clone();

        deepEqual(path.asArray, clonePath.asArray, "Path buffers represent the same path");
        notStrictEqual(path, clonePath, "Clone is different from original");
        notStrictEqual(path.asArray, clonePath.asArray, "Clone's buffer is different from original");
    });

    test("Trimming", function () {
        var originalPath = sntls.Path.create(['test', 'originalPath', 'it', 'is']),
            trimmedPath = originalPath.trim();

        notStrictEqual(originalPath, trimmedPath, "Trimming returns new Path");

        deepEqual(
            originalPath.asArray,
            ['test', 'originalPath', 'it', 'is'],
            "Original path intact"
        );

        deepEqual(
            trimmedPath.asArray,
            ['test', 'originalPath', 'it'],
            "Trimmed path"
        );
    });

    test("Prepending", function () {
        var originalPath = sntls.Path.create(['test', 'originalPath', 'it', 'is']),
            prependedPath = originalPath.prepend('foo.bar'.toPath());

        notStrictEqual(originalPath, prependedPath, "Prepending returns new Path");

        deepEqual(
            originalPath.asArray,
            ['test', 'originalPath', 'it', 'is'],
            "Original path intact"
        );

        deepEqual(
            prependedPath.asArray,
            ['foo', 'bar', 'test', 'originalPath', 'it', 'is'],
            "Prepended path"
        );
    });

    test("Equality", function () {
        /** @type sntls.Path */
        var path = sntls.Path.create('test.path.it.is');

        equal(path.equals(sntls.Path.create('test.path.it.is')), true, "Matching path");
        equal(path.equals(sntls.Path.create('path.it.is')), false, "Non-matching path");

        equal(path.equals('test.path.it.is'.toPath()), true, "Matching string path");
        equal(path.equals('path.it.is'.toPath()), false, "Non-matching string path");

        equal(path.equals(['test', 'path', 'it', 'is'].toPath()), true, "Matching array path");
        equal(path.equals(['path', 'it', 'is'].toPath()), false, "Non-matching array path");
    });

    test("Relative paths", function () {
        var root = sntls.Path.create('test.path'),
            path = sntls.Path.create('test.path.it.is');

        ok(path.isRelativeTo(root), "Path is relative to root");
        ok(root.isRelativeTo(root.clone()), "Root is relative to itself");
        ok(!root.isRelativeTo(path), "Root is not relative to path");
    });

    test("Path resolution", function () {
        var path = sntls.Path.create('hello.world');

        raises(function () {
            path.resolve();
        }, "Resolution requires a context");

        raises(function () {
            path.resolve('foo');
        }, "Invalid context object");

        equal(typeof path.resolve({}), 'undefined', "Can't resolve on empty object");

        equal(path.resolve({
            hello: {
                world: '!!'
            }
        }), '!!', "sntls.Path resolved");
    });

    test("Building path", function () {
        var path = sntls.Path.create('foo.bar'),
            context = {
                hello: "world"
            };

        raises(function () {
            path.resolveOrBuild();
        }, "sntls.Path builder requires a context");

        raises(function () {
            path.resolveOrBuild('foo');
        }, "Invalid context object");

        path.resolveOrBuild(context);

        deepEqual(path.asArray, ['foo', 'bar'], "Array representation untouched by build");

        deepEqual(context, {
            hello: "world",
            foo  : {
                bar: {}
            }
        }, "sntls.Path built");

        sntls.Path.create('hello.world').resolveOrBuild(context);

        deepEqual(context, {
            hello: {
                world: {}
            },
            foo  : {
                bar: {}
            }
        }, "Existing path overwritten");
    });

    test("String conversion", function () {
        var path = 'test.path.hello.world'.toPath();

        ok(sntls.Path.isBaseOf(path), "Path type");
        deepEqual(path.asArray, ['test', 'path', 'hello', 'world'], "Path contents");
    });

    test("Array conversion", function () {
        var path = ['test', 'path', 'hello', 'world'].toPath();

        ok(sntls.Path.isBaseOf(path), "Path type");
        deepEqual(path.asArray, ['test', 'path', 'hello', 'world'], "Path contents");
    });
}());
