/*global sntls, troop, module, test, ok, equal, strictEqual, notStrictEqual, deepEqual, raises, expect */
(function () {
    "use strict";

    module("Utils");

    test("Object property count", function () {
        ok(sntls.Utils.isEmptyObject({}), "Empty object");
        ok(!sntls.Utils.isEmptyObject({foo: "bar"}), "Non-empty object");

        ok(sntls.Utils.isSingularObject({foo: "bar"}), "Singular object");
        ok(!sntls.Utils.isSingularObject({}), "Non-singular object (too few)");
        ok(!sntls.Utils.isSingularObject({foo: "bar", hello: "world"}), "Non-singular object (too many)");
    });

    test("Shallow copy", function () {
        var referenceObject = {},
            originalObject = {
                foo: referenceObject,
                bar: referenceObject
            },
            originalArray = [referenceObject, referenceObject],
            copyObject = sntls.Utils.shallowCopy(originalObject),
            copyArray = sntls.Utils.shallowCopy(originalArray);

        deepEqual(copyArray, originalArray, "Arrays identical by value");
        deepEqual(copyObject, originalObject, "Objects identical by value");
        notStrictEqual(copyArray, originalArray, "Arrays not identical by reference");
        notStrictEqual(copyObject, originalObject, "Objects not identical by reference");
        strictEqual(copyArray[0], originalArray[0], "Array items identical by reference");
        strictEqual(copyObject.foo, originalObject.foo, "Object properties identical by reference");
    });
}());