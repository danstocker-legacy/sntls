/*global troop, sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Query");

    test("Instantiation", function () {
        var query;

        raises(function () {
            sntls.Query.create(5);
        }, "should raise exception on invalid arguments");

        raises(function () {
            sntls.Query.create('foo');
        }, "should raise exception on invalid arguments");

        query = sntls.Query.create(['hello', '|'.toKVP(), 'you<all'.toKVP()]);
        equal(query.asArray[0], 'hello', "should set string key as is");
        equal(query.asArray[1].descriptor.symbol, '|', "should set symbol-based KVP");
        deepEqual(query.asArray[2].descriptor.options, ['you', 'all'], "should set options-based KVP");
    });

    test("Conversion from string", function () {
        var query;

        query = 'hello%3E>|>you<all'.toQuery();
        equal(query.asArray[0], 'hello>', "should URI decode literal keys");
        equal(query.asArray[1].descriptor.symbol, '|', "should convert wildcard to KVP");
        deepEqual(query.asArray[2].descriptor.options, ['you', 'all'], "should convert options to KVP");

        query = '\\'.toQuery();
        strictEqual(query.asArray[0], sntls.Query.PATTERN_SKIP, "should convert skipper to KVP");

        query = 'foo>{bar}'.toQuery();
        deepEqual(query.asArray[1], '{bar}'.toKVP(), "should handle markers");
    });

    test("Conversion from array", function () {
        var query;

        query = ['hello>', '|', ['foo', 'bar']].toQuery();
        equal(query.asArray[0], 'hello>', "should URI decode literal keys");
        equal(query.asArray[1], '|', "should preserve string symbols");
        deepEqual(query.asArray[2].descriptor.options, ['foo', 'bar'], "should convert options to KVP");

        query = ['|'.toKVP(), 'you<all'.toKVP()].toQuery();
        equal(query.asArray[0].descriptor.symbol, '|', "should convert wildcard to KVP");
        deepEqual(query.asArray[1].descriptor.options, ['you', 'all'], "should leave options passed as KVP intact");

        query = ['\\'.toKVP()].toQuery();
        strictEqual(query.asArray[0], sntls.Query.PATTERN_SKIP, "should preserve skipper KVP");
    });

    test("Fallback conversion from string", function () {
        var query;

        query = 'test>path>it>is'.toPathOrQuery();
        ok(query.isA(sntls.Path), "should return Path instance");
        ok(!query.isA(sntls.Query), "should not return query instance for expression that has no KVPs");

        query = 'test>\\>path>it<that>is'.toPathOrQuery();
        ok(query.isA(sntls.Query),
            "should return Query instance for expression that does have KVPs in it");
    });

    test("Fallback conversion from array", function () {
        var query;

        query = ['test', 'path', 'it', 'is'].toPathOrQuery();
        ok(query.isA(sntls.Path), "should return Path instance");
        ok(!query.isA(sntls.Query), "should not return query instance for expression that has no KVPs");

        query = ['test', sntls.KeyValuePattern.create('|'), 'it', 'is'].toPathOrQuery();
        ok(query.isA(sntls.Query),
            "should return Query instance for expression that does have KVPs in it");
    });

    test("Stem extraction", function () {
        var query = 'foo>bar>hello<world>|'.toQuery(),
            result;

        result = query.getStemPath();

        ok(result.instanceOf(sntls.Path), "should return Path instance");
        deepEqual(result.asArray, ['foo', 'bar'], "should set path contents");
    });

    test("Matching path against path", function () {
        var query = 'test>path>foo'.toQuery();

        ok(query.matchesPath('test>path>foo'.toPath()), "should return true for identical path");
        ok(!query.matchesPath('test>path>bar'.toPath()), "should return false for path with non-matching key");
        ok(!query.matchesPath('test>path'.toPath()), "should return false for path shorter than current path");
    });

    test("Matching wildcard at end of query to path", function () {
        var query = 'test>path>|'.toQuery();

        ok(!query.matchesPath('test>path>foo>bar'.toPath()), "should return false on path of different length");
        ok(query.matchesPath('test>path>foo'.toPath()), "should return true for matching path");
        ok(!query.matchesPath('test>path'.toPath()), "should return false on path shorter than query");
    });

    test("Matching wildcard in middle of query to path", function () {
        var query = 'test>|>foo'.toQuery();

        ok(query.matchesPath('test>path>foo'.toPath()), "should return true on matching path");
        ok(!query.matchesPath('foo>path>foo'.toPath()), "should return false for non-matching path of equal length");
        ok(!query.matchesPath('test>path>foo>bar'.toPath()), "should return false for path longer than query");
        ok(!query.matchesPath('test>path'.toPath()), "should return false for path shorter than query");
    });

    test("Matching query with leaf node value to path", function () {
        var query = 'test>|^bar'.toQuery();

        ok(!query.matchesPath('test>path>foo>bar'.toPath()), "should return false on path of different length");
        ok(query.matchesPath('test>path'.toPath()), "should return true for matching path");
        ok(!query.matchesPath('test'.toPath()), "should return false on path shorter than query");
    });

    test("Matching skipper in query to path", function () {
        var query = 'test>\\>foo'.toQuery();

        ok(query.matchesPath('test>path>foo'.toPath()), "should return true for single skipped key");
        ok(query.matchesPath('test>foo'.toPath()), "should return true for zero skipped key");
        ok(query.matchesPath('test>path>hello>world>foo'.toPath()), "should return true for multiple skipped keys");
        ok(!query.matchesPath('test>path>foo>bar'.toPath()), "should return false for non-matching path");
    });

    test("Matching skipper at end of query to path", function () {
        var query = 'test>path>\\'.toQuery();

        ok(query.matchesPath('test>path'.toPath()), "should return true for zero keys to skip");
        ok(query.matchesPath('test>path>foo>bar'.toPath()), "should return true for non-zero skipped keys");
    });

    test("Matching skippers at end of query to path", function () {
        var query = 'test>path>\\>\\'.toQuery();
        ok(query.matchesPath('test>path'.toPath()), "should behave like a single skipper");
    });

    test("Matching skipper and primitive at end od query to path", function () {
        var query = 'test>\\>"'.toQuery();
        ok(query.matchesPath('test>path'.toPath()), "should behave like skipper only at end");
    });

    test("Matching query with wildcard followed by skipper", function () {
        var query = 'test>path>|>\\'.toQuery();

        ok(query.matchesPath('test>path>foo>bar'.toPath()), "should return true for matching path");
        ok(query.matchesPath('test>path>foo'.toPath()), "should return true for matching path");
        ok(!query.matchesPath('test>path'.toPath()), "should return false for too short path");
    });

    test("Matching query with multiple skippers", function () {
        var query = 'test>\\>|>path>|>foo>\\'.toQuery();

        ok(query.matchesPath('test>hello>path>world>foo>some>more>keys'.toPath()),
            "should return true for matching path");

    });

    test("Matching query with multiple skippers", function () {
        var query = '\\>test>\\>path>foo>bar'.toQuery();

        ok(query.matchesPath('hello>world>test>path>foo>bar'.toPath()),
            "should return true for matching path");
    });

    test("Root tester", function () {
        var query = 'foo>|>bar'.toQuery();

        ok(query.isRootOf('foo>baz>bar>hello'.toPath()), "should return true for matching path");
        ok(query.isRootOf('foo>baz>bar'.toPath()), "should return true for exact match");
        ok(!query.isRootOf('foo>hello>world'.toPath()), "should return false for non-matching path");
    });

    test("Relative path tester", function () {
        var query = 'foo>bar>|>1'.toQuery(),
            path = 'foo>bar'.toPath();

        ok(query.isRelativeTo(path), "should return true for matching path");
    });

    test("Serialization", function () {
        var query = sntls.Query.create(['foo%5E', '\\', 'bar', 'hello%5E<world', '|', '|^baz']);

        equal(query.toString(), 'foo%5E>\\>bar>hello%5E<world>|>|^baz', "should generate correct string");
    });
}());
