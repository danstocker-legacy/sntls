/*global troop, sntls, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Key-Value Pattern");

    test("URI decode", function () {
        deepEqual(
            sntls.KeyValuePattern._encodeURI(['f|o', 'b<r']),
            ['f%7Co', 'b%3Cr'],
            "Key-value pattern encoded"
        );
    });

    test("URI decode", function () {
        deepEqual(
            sntls.KeyValuePattern._decodeURI(['f%7Co', 'b%3Cr']),
            ['f|o', 'b<r'],
            "Key-value pattern decoded"
        );
    });

    test("Pattern parsing", function () {
        equal(
            sntls.KeyValuePattern._parseString('foo%5E'),
            'foo^',
            "String literal pattern"
        );

        deepEqual(
            sntls.KeyValuePattern._parseString('{foo%5E}'),
            {
                key   : 'foo^',
                marker: '{'
            },
            "Marked string literal pattern"
        );

        deepEqual(
            sntls.KeyValuePattern._parseString('foo%5E<bar%5E'),
            {
                options: ['foo^', 'bar^']
            },
            "Optional keys pattern"
        );

        deepEqual(
            sntls.KeyValuePattern._parseString('[foo%5E<bar%5E]'),
            {
                options: ['foo^', 'bar^'],
                marker : '['
            },
            "Marked optional keys pattern"
        );

        deepEqual(
            sntls.KeyValuePattern._parseString('|'),
            {
                symbol: '|'
            },
            "Wildcard pattern"
        );

        deepEqual(
            sntls.KeyValuePattern._parseString('[|]'),
            {
                symbol: '|',
                marker: '['
            },
            "Marked wildcard pattern"
        );

        deepEqual(
            sntls.KeyValuePattern._parseString('\\'),
            {
                symbol: '\\'
            },
            "Skip pattern"
        );

        deepEqual(
            sntls.KeyValuePattern._parseString('{\\}'),
            {
                symbol: '\\'
            },
            "Marked skip pattern (invalid)"
        );

        deepEqual(
            sntls.KeyValuePattern._parseString('foo%5E^bar%5E'),
            {
                key  : 'foo^',
                value: 'bar^'
            },
            "Key/value literal pattern"
        );

        deepEqual(
            sntls.KeyValuePattern._parseString('foo%5E<bar%5E^baz%5E'),
            {
                options: ['foo^', 'bar^'],
                value  : 'baz^'
            },
            "Optional key/value pattern"
        );

        deepEqual(
            sntls.KeyValuePattern._parseString('|^bar%5E'),
            {
                symbol: '|',
                value : 'bar^'
            },
            "Wildcard pattern with value"
        );

        deepEqual(
            sntls.KeyValuePattern._parseString('\\^bar%5E'),
            {
                symbol: '\\'
            },
            "Skip pattern with value (invalid)"
        );
    });

    test("Instantiation", function () {
        var descriptor,
            pattern;

        raises(function () {
            sntls.KeyValuePattern.create(4);
        }, "Key-value pattern initialized w/ other than string, array, or object");

        pattern = sntls.KeyValuePattern.create('|^foo');
        deepEqual(
            pattern.descriptor,
            sntls.KeyValuePattern._parseString('|^foo'),
            "Descriptor parsed from string"
        );

        descriptor = {symbol: '|', value: 'foo'};
        pattern = sntls.KeyValuePattern.create(descriptor);
        deepEqual(
            pattern.descriptor,
            sntls.KeyValuePattern._parseString('|^foo'),
            "Descriptor supplied as object"
        );
        strictEqual(
            pattern.descriptor,
            descriptor,
            "Descriptor supplied as object"
        );

        pattern = sntls.KeyValuePattern.create(['foo', 'bar']);
        deepEqual(
            pattern.descriptor,
            sntls.KeyValuePattern._parseString('foo<bar'),
            "Descriptor created from array"
        );
    });

    test("Type conversion", function () {
        var pattern;

        if (troop.Feature.hasPropertyAttributes()) {
            ok(!Array.prototype.propertyIsEnumerable('toKeyValuePattern'), "Array type converter is not enumerable");
            ok(!Array.prototype.propertyIsEnumerable('toKVP'), "Array type converter is not enumerable");
            ok(!String.prototype.propertyIsEnumerable('toKeyValuePattern'), "String type converter is not enumerable");
            ok(!String.prototype.propertyIsEnumerable('toKVP'), "String type converter is not enumerable");
        }

        pattern = '|'.toKeyValuePattern();
        ok(pattern.isA(sntls.KeyValuePattern), "Type of converted value");
        deepEqual(
            pattern.descriptor,
            sntls.KeyValuePattern.create('|').descriptor,
            "Pattern contents"
        );

        pattern = ['foo', 'bar'].toKeyValuePattern();
        ok(pattern.isA(sntls.KeyValuePattern), "Type of converted value");
        deepEqual(
            pattern.descriptor,
            sntls.KeyValuePattern.create('foo<bar').descriptor,
            "Pattern contents"
        );

        pattern = '|'.toKVP();
        ok(pattern.isA(sntls.KeyValuePattern), "Type of converted value");
        deepEqual(
            pattern.descriptor,
            sntls.KeyValuePattern.create('|').descriptor,
            "Pattern contents"
        );

        pattern = ['foo', 'bar'].toKVP();
        ok(pattern.isA(sntls.KeyValuePattern), "Type of converted value");
        deepEqual(
            pattern.descriptor,
            sntls.KeyValuePattern.create('foo<bar').descriptor,
            "Pattern contents"
        );
    });

    test("Setting value", function () {
        var pattern;

        pattern = '|'.toKeyValuePattern().setValue('foo');
        deepEqual(
            pattern.descriptor,
            {symbol: '|', value: 'foo'},
            "Value set on wildcard pattern"
        );

        pattern = 'a<b'.toKeyValuePattern().setValue('foo');
        deepEqual(
            pattern.descriptor,
            {options: ['a', 'b'], value: 'foo'},
            "Value set on options pattern"
        );

        pattern = 'a'.toKeyValuePattern().setValue('foo');
        deepEqual(
            pattern.descriptor,
            {key: 'a', value: 'foo'},
            "Value set on key/value pattern"
        );
    });

    test("Skipper detection", function () {
        ok(!sntls.KeyValuePattern.create('hello').isSkipper(), "Literal not skipper");
        ok(sntls.KeyValuePattern.create('\\').isSkipper(), "Skipper");
    });

    test("Marker retrieval", function () {
        ok(!'hello'.toKVP().getMarker(), "No marker");
        equal('[hello]'.toKVP().getMarker(), '[', "Bracket");
        equal('{hello}'.toKVP().getMarker(), '{', "Curly brace");
    });

    test("Marker setter", function () {
        var kvp = 'hello'.toKVP(),
            result;

        equal(kvp.descriptor, 'hello', "String descriptor");

        raises(function () {
            kvp.setMarker();
        }, "Invalid marker");

        raises(function () {
            kvp.setMarker('foo');
        }, "Invalid marker");

        result = kvp.setMarker('[');

        strictEqual(result, kvp, "Is chainable");
        deepEqual(kvp.descriptor, {
            key   : 'hello',
            marker: '['
        });
    });

    test("Key match", function () {
        ok(sntls.KeyValuePattern.create('hello').matchesKey('hello'), "Key matches string");
        ok(!sntls.KeyValuePattern.create('foo').matchesKey('hello'), "Key doesn't match different string");

        ok(sntls.KeyValuePattern.create('|').matchesKey('hello'), "Key matches wildcard");
        ok(!sntls.KeyValuePattern.create({}).matchesKey('hello'), "Key doesn't match unknown wildcard");

        ok(sntls.KeyValuePattern.create('|^foo').matchesKey('hello'), "Key matches value pattern");

        ok(sntls.KeyValuePattern.create('hello<world').matchesKey('hello'), "Key matches choices");
        ok(!sntls.KeyValuePattern.create('foo<bar').matchesKey('hello'), "Key doesn't match choices it's not in");
    });

    test("String representation", function () {
        equal(
            sntls.KeyValuePattern.create({symbol: '|', value: 'foo^'}).toString(),
            '|^foo%5E',
            "Wildcard with value"
        );

        equal(
            sntls.KeyValuePattern.create({symbol: '\\'}).toString(),
            '\\',
            "Skipper"
        );

        equal(
            sntls.KeyValuePattern.create({options: ['foo^', 'bar^']}).toString(),
            'foo%5E<bar%5E',
            "Options"
        );

        equal(
            sntls.KeyValuePattern.create({options: ['foo^', 'bar^'], value: 'baz^'}).toString(),
            'foo%5E<bar%5E^baz%5E',
            "Options with value"
        );
    });
}());
