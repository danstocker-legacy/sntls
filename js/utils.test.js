/*global sntls, troop, module, test, ok, equal, strictEqual, notStrictEqual, deepEqual, raises, expect */
(function () {
    "use strict";

    module("utils");

    test("Shallow copy", function () {
        var referenceObject = {},
            originalObject = {
                foo: referenceObject,
                bar: referenceObject
            },
            originalArray = [referenceObject, referenceObject],
            copyObject = sntls.utils.shallowCopy(originalObject),
            copyArray = sntls.utils.shallowCopy(originalArray);

        deepEqual(copyArray, originalArray, "Arrays identical by value");
        deepEqual(copyObject, originalObject, "Objects identical by value");
        notStrictEqual(copyArray, originalArray, "Arrays not identical by reference");
        notStrictEqual(copyObject, originalObject, "Objects not identical by reference");
        strictEqual(copyArray[0], originalArray[0], "Array items identical by reference");
        strictEqual(copyObject.foo, originalObject.foo, "Object properties identical by reference");
    });
}());