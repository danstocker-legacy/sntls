/*global sntls, sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Query Pattern");

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
}());
