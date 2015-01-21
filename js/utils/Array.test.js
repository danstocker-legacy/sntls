/*global sntls, troop, module, test, ok, equal, strictEqual, notStrictEqual, deepEqual, raises, expect */
(function () {
    "use strict";

    module("Array");

    test("Path array conversion", function () {
        deepEqual(
            ['foo', 5, true, {}, undefined].toPathArray(),
            ['foo', '5', 'true', {}, undefined],
            "should convert numbers to string");
    });

    test("URI encoding", function () {
        deepEqual(
            ['f|o', 'b<r'].toUriEncoded(),
            ['f%7Co', 'b%3Cr'],
            "should return string of URI encoded strings");
    });

    test("URI decode", function () {
        deepEqual(
            ['f%7Co', 'b%3Cr'].toUriDecoded(),
            ['f|o', 'b<r'],
            "should return string of URI decoded strings");
    });
}());