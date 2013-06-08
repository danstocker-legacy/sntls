/*global sntls, sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Query");

    test("URI encode", function () {
        deepEqual(
            sntls.Query._encodeURI([
                ['f|o', 'b<r'],
                {},
                'baz\\'
            ]),
            [
                ['f%7Co', 'b%3Cr'],
                {},
                'baz%5C'
            ],
            "Query structure encoded"
        );
    });

    test("URI decode", function () {
        deepEqual(
            sntls.Query._decodeURI([
                ['f%7Co', 'b%3Cr'],
                {},
                'baz%5C'
            ]),
            [
                ['f|o', 'b<r'],
                {},
                'baz\\'
            ],
            "Query structure decoded"
        );
    });

    test("Parsing", function () {
        var Query = sntls.Query,
            query = 'foo>\\>bar>hello<world>|';

        deepEqual(
            sntls.Query._parseString(query),
            ['foo', Query.PATTERN_SKIP, 'bar', ['hello', 'world'], Query.PATTERN_ASTERISK],
            "Query parsed"
        );
    });

    test("Matching key to pattern", function () {
        ok(sntls.Query._matchKeyToPattern('hello', 'hello'), "Key matches string");
        ok(!sntls.Query._matchKeyToPattern('hello', 'foo'), "Key doesn't match different string");

        ok(sntls.Query._matchKeyToPattern('hello', sntls.Query.PATTERN_ASTERISK), "Key matches wildcard");
        ok(!sntls.Query._matchKeyToPattern('hello', {}), "Key doesn't match unknown wildcard");

        ok(sntls.Query._matchKeyToPattern('hello', ['hello', 'world']), "Key matches choices");
        ok(!sntls.Query._matchKeyToPattern('hello', ['foo', 'bar']), "Key doesn't match choices it's not in");
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

    test("Instantiation", function () {
        var query;

        raises(function () {
            sntls.Query.create(5);
        }, "Invalid query");

        query = sntls.Query.create(['hello', sntls.Query.PATTERN_ASTERISK, ['you', 'all']]);
        deepEqual(
            query.asArray,
            ['hello', sntls.Query.PATTERN_ASTERISK, ['you', 'all']],
            "Query initialized w/ array"
        );

        query = sntls.Query.create('hello>|>you<all');
        deepEqual(
            query.asArray,
            ['hello', sntls.Query.PATTERN_ASTERISK, ['you', 'all']],
            "Query initialized w/ string"
        );
    });

    test("Instantiation as surrogate", function () {
        var query;

        query = sntls.Path.create('test>path>it>is');
        ok(!query.isA(sntls.Query), "Path did not satisfy query conditions");

        query = sntls.Path.create('test>\\>path>it<that>is');
        ok(query.isA(sntls.Query), "Path created Query instance");
    });

    test("Type conversion", function () {
        var query;

        query = ['hello', sntls.Query.PATTERN_ASTERISK, ['you', 'all']].toQuery();
        deepEqual(
            query.asArray,
            ['hello', sntls.Query.PATTERN_ASTERISK, ['you', 'all']],
            "Query initialized from array"
        );

        query = 'hello>|>you<all'.toQuery();
        deepEqual(
            query.asArray,
            ['hello', sntls.Query.PATTERN_ASTERISK, ['you', 'all']],
            "Query initialized from string"
        );
    });

    test("Stem extraction", function () {
        var Query = sntls.Query,
            query = Query.create(['foo', 'bar', ['hello', 'world'], Query.PATTERN_ASTERISK]),
            result;

        result = query.getStemPath();

        ok(result.instanceOf(sntls.Path), "Stem path is class Path");
        deepEqual(result.asArray, ['foo', 'bar'], "Stem path buffer");
    });

    test("Serialization", function () {
        var Query = sntls.Query,
            query = Query.create([
                'foo', Query.PATTERN_SKIP, 'bar', ['hello', 'world'], Query.PATTERN_ASTERISK
            ]);

        equal(query.toString(), 'foo>\\>bar>hello<world>|', "Query in string form");
    });
}());
