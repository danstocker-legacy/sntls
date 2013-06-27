/*global sntls, sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Query Pattern");

    test("URI decode", function () {
        deepEqual(
            sntls.QueryPattern._encodeURI(['f|o', 'b<r']),
            ['f%7Co', 'b%3Cr'],
            "Query pattern encoded"
        );
    });

    test("URI decode", function () {
        deepEqual(
            sntls.QueryPattern._decodeURI(['f%7Co', 'b%3Cr']),
            ['f|o', 'b<r'],
            "Query pattern decoded"
        );
    });

    test("Pattern parsing", function () {
        equal(
            sntls.QueryPattern._parseString('foo%5E'),
            'foo^',
            "String literal pattern"
        );

        deepEqual(
            sntls.QueryPattern._parseString('foo%5E<bar%5E'),
            {
                options: ['foo^', 'bar^']
            },
            "Optional keys pattern"
        );

        deepEqual(
            sntls.QueryPattern._parseString('|'),
            {
                symbol: '|'
            },
            "Wildcard pattern"
        );

        deepEqual(
            sntls.QueryPattern._parseString('\\'),
            {
                symbol: '\\'
            },
            "Skip pattern"
        );

        deepEqual(
            sntls.QueryPattern._parseString('foo%5E^bar%5E'),
            {
                key  : 'foo^',
                value: 'bar^'
            },
            "Key/value literal pattern"
        );

        deepEqual(
            sntls.QueryPattern._parseString('foo%5E<bar%5E^baz%5E'),
            {
                options: ['foo^', 'bar^'],
                value  : 'baz^'
            },
            "Optional key/value pattern"
        );

        deepEqual(
            sntls.QueryPattern._parseString('|^bar%5E'),
            {
                symbol: '|',
                value : 'bar^'
            },
            "Wildcard pattern with value"
        );

        deepEqual(
            sntls.QueryPattern._parseString('\\^bar%5E'),
            {
                symbol: '\\'
            },
            "Skip pattern with value (invalid)"
        );
    });

    test("Instantiation", function () {
        var descriptor,
            pattern;

        pattern = sntls.QueryPattern.create('|^foo');
        deepEqual(
            pattern.descriptor,
            sntls.QueryPattern._parseString('|^foo'),
            "Descriptor parsed from string"
        );

        descriptor = {symbol: '|', value: 'foo'};
        pattern = sntls.QueryPattern.create(descriptor);
        deepEqual(
            pattern.descriptor,
            sntls.QueryPattern._parseString('|^foo'),
            "Descriptor supplied as object"
        );
        strictEqual(
            pattern.descriptor,
            descriptor,
            "Descriptor supplied as object"
        );
    });

    test("Skipper detection", function () {
        ok(!sntls.QueryPattern.create('hello').isSkipper(), "Literal not skipper");
        ok(sntls.QueryPattern.create('\\').isSkipper(), "Skipper");
    });

    test("Key match", function () {
        ok(sntls.QueryPattern.create('hello').matchesKey('hello'), "Key matches string");
        ok(!sntls.QueryPattern.create('foo').matchesKey('hello'), "Key doesn't match different string");

        ok(sntls.QueryPattern.create('|').matchesKey('hello'), "Key matches wildcard");
        ok(!sntls.QueryPattern.create({}).matchesKey('hello'), "Key doesn't match unknown wildcard");

        ok(sntls.QueryPattern.create('|^foo').matchesKey('hello'), "Key matches value pattern");

        ok(sntls.QueryPattern.create('hello<world').matchesKey('hello'), "Key matches choices");
        ok(!sntls.QueryPattern.create('foo<bar').matchesKey('hello'), "Key doesn't match choices it's not in");
    });

    test("String representation", function () {
        equal(
            sntls.QueryPattern.create({symbol: '|', value: 'foo^'}).toString(),
            '|^foo%5E',
            "Wildcard with value"
        );

        equal(
            sntls.QueryPattern.create({symbol: '\\'}).toString(),
            '\\',
            "Skipper"
        );

        equal(
            sntls.QueryPattern.create({options: ['foo^', 'bar^']}).toString(),
            'foo%5E<bar%5E',
            "Options"
        );

        equal(
            sntls.QueryPattern.create({options: ['foo^', 'bar^'], value: 'baz^'}).toString(),
            'foo%5E<bar%5E^baz%5E',
            "Options with value"
        );
    });
}());
