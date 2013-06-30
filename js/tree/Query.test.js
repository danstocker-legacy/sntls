/*global sntls, sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Query");

    test("Query validation", function () {
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('|>foo>bar'));
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('foo>bar>|>baz'));
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('foo>bar>|'));
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('\\>foo>bar'));
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('foo>bar>\\>baz'));
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('foo>bar>\\'));
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('foo>foo<baz>bar'));
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('foo>foo<baz<boo>bar'));
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('foo>moo>bar'), "Specific node where key is 'bar'");
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('foo>bar>foo^hello'), "Specific node where key is 'foo' and value is 'hello'");
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('foo>bar>^hello'), "Specific node where key is empty and value is 'hello'");
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('foo>bar>|^hello'));
        ok(!sntls.Query.RE_QUERY_VALIDATOR.test('foo>bar>|^hello>baz'), "Not query b/c value pattern is not last");
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('foo^bar'), "Specific key/value pair under root");
        ok(sntls.Query.RE_QUERY_VALIDATOR.test('|^bar'));
    });

    test("Matching query to path", function () {
        var query;

        query = 'test>path>foo'.toQuery();
        ok(query.matchesPath('test>path>foo'.toPath()), "Static query matched by path");
        ok(!query.matchesPath('test>path>bar'.toPath()), "Static query not matched by path");

        query = 'test>|>foo'.toQuery();
        ok(query.matchesPath('test>path>foo'.toPath()), "Query w/ wildcard matched by path");
        ok(!query.matchesPath('foo>path>foo'.toPath()), "Query w/ wildcard not matched by path");
        ok(!query.matchesPath('test>path>foo>bar'.toPath()), "Query w/ wildcard not matched by path");
        ok(!query.matchesPath('test>path'.toPath()), "Query w/ wildcard not matched by path");

        query = 'test>|^bar'.toQuery();
        ok(query.matchesPath('test>path'.toPath()), "Query w/ value pattern matched by path");
        ok(!query.matchesPath('foo>path'.toPath()), "Query w/ value pattern not matched by path");
        ok(!query.matchesPath('test>path>foo'.toPath()), "Query w/ value pattern not matched by path");
        ok(!query.matchesPath('test'.toPath()), "Query w/ value pattern not matched by path");

        query = 'test>\\>foo'.toQuery();
        ok(query.matchesPath('test>path>foo'.toPath()), "Query w/ skipping matched by path");
        ok(query.matchesPath('test>path>hello>foo'.toPath()), "Query w/ skipping matched by path");
        ok(query.matchesPath('test>path>hello>world>foo'.toPath()), "Query w/ skipping matched by path");
        ok(!query.matchesPath('test>path>foo>bar'.toPath()), "Query w/ skipping not matched by path");

        query = '\\>test>foo'.toQuery();
        ok(query.matchesPath('test>foo'.toPath()), "Query w/ skipping at start matched by path");
        ok(query.matchesPath('hello>world>test>foo'.toPath()), "Query w/ skipping at start matched by path");
        ok(!query.matchesPath('test>path'.toPath()), "Query w/ skipping at start not matched by path");

        query = 'test>path>\\'.toQuery();
        ok(query.matchesPath('test>path>foo>bar'.toPath()), "Query w/ skipping at end matched by path");
    });

    test("Complex query matching", function () {
        var query;

        query = 'test>\\>|>path>|>foo>\\'.toQuery();
        ok(query.matchesPath('test>hello>path>world>foo>some>more>keys'.toPath()), "Query matched");

        query = '\\>test>\\>path>foo>bar'.toQuery();
        ok(query.matchesPath('hello>world>test>path>foo>bar'.toPath()), "Query matched");
    });

    test("Buffer normalization", function () {
        var Query = sntls.Query,
            buffer;

        buffer = Query._normalizeBuffer(['hello', '|', 'you<all', ['foo', 'bar']]);
        equal(buffer[0], 'hello');
        equal(buffer[1].descriptor.symbol, '|');
        deepEqual(buffer[2].descriptor.options, ['you', 'all']);
        deepEqual(buffer[3].descriptor.options, ['foo', 'bar']);

        buffer = Query._normalizeBuffer(['hello', '\\']);
        strictEqual(buffer[1], sntls.Query.PATTERN_SKIP, "Skipper expression converted to common skipper instance");

        buffer = Query._normalizeBuffer(['hello', sntls.QueryPattern.create('\\')]);
        strictEqual(buffer[1], sntls.Query.PATTERN_SKIP, "Skipper pattern converted to common skipper instance");
    });

    test("Instantiation", function () {
        var query;

        raises(function () {
            sntls.Query.create(5);
        }, "Invalid query");

        query = sntls.Query.create(['hello', '|', 'you<all']);
        equal(query.asArray[0], 'hello');
        equal(query.asArray[1].descriptor.symbol, '|');
        deepEqual(query.asArray[2].descriptor.options, ['you', 'all']);

        query = sntls.Query.create('hello>|>you<all');
        equal(query.asArray[0], 'hello');
        equal(query.asArray[1].descriptor.symbol, '|');
        deepEqual(query.asArray[2].descriptor.options, ['you', 'all']);
    });

    test("Type conversion", function () {
        var query;

        query = ['hello', '|', 'you<all'].toQuery();
        equal(query.asArray[0], 'hello');
        equal(query.asArray[1].descriptor.symbol, '|');
        deepEqual(query.asArray[2].descriptor.options, ['you', 'all']);

        query = 'hello>|>you<all'.toQuery();
        equal(query.asArray[0], 'hello');
        equal(query.asArray[1].descriptor.symbol, '|');
        deepEqual(query.asArray[2].descriptor.options, ['you', 'all']);
    });

    test("Relative paths", function () {
        var query = 'foo>bar>|>1'.toQuery(),
            path = 'foo>bar'.toPath();

        ok(query.isRelativeTo(path), "Query relative to path");
    });

    test("Type conversion with either types", function () {
        var query;

        query = 'test>path>it>is'.toPathOrQuery();
        ok(!query.isA(sntls.Query), "String path did not satisfy query conditions");

        query = 'test>\\>path>it<that>is'.toPathOrQuery();
        ok(query.isA(sntls.Query), "String path created Query instance");

        query = ['test', 'path', 'it', 'is'].toPathOrQuery();
        ok(!query.isA(sntls.Query), "Array path did not satisfy query conditions");

        query = ['test', sntls.QueryPattern.create('|'), 'it', 'is'].toPathOrQuery();
        ok(query.isA(sntls.Query), "Array path created Query instance");
    });

    test("Stem extraction", function () {
        var Query = sntls.Query,
            query = Query.create('foo>bar>hello<world>|'),
            result;

        result = query.getStemPath();

        ok(result.instanceOf(sntls.Path), "Stem path is class Path");
        deepEqual(result.asArray, ['foo', 'bar'], "Stem path buffer");
    });

    test("Serialization", function () {
        var query = sntls.Query.create(['foo%5E', '\\', 'bar', 'hello%5E<world', '|', '|^baz']);

        equal(query.toString(), 'foo%5E>\\>bar>hello%5E<world>|>|^baz', "Query in string form");
    });
}());
