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

        equal(sntls.Utils.shallowCopy(undefined), undefined, "should return undefined for undefined");
        equal(sntls.Utils.shallowCopy(5), 5, "should return original for primitive");
        notStrictEqual(copyArray, originalArray, "should return different array instance for array");
        deepEqual(copyArray, originalArray, "should return array with identical contents for array");
        notStrictEqual(copyObject, originalObject, "should return different object instance for object");
        deepEqual(copyObject, originalObject, "should return object with identical contents for object");
    });
}());