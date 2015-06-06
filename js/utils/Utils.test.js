/*global sntls, troop, module, test, ok, equal, strictEqual, notStrictEqual, deepEqual, raises, expect */
(function () {
    "use strict";

    module("Utils");

    test("Empty object tester", function () {
        ok(sntls.Utils.isEmptyObject({}), "should return true for empty object");
        ok(!sntls.Utils.isEmptyObject({foo: "bar"}), "should return false for non-empty object");
    });

    test("Singular object tester", function () {
        ok(sntls.Utils.isSingularObject({foo: "bar"}), "should return true for singular object");
        ok(!sntls.Utils.isSingularObject({}), "should return false for empty object");
        ok(!sntls.Utils.isSingularObject({foo: "bar", hello: "world"}),
            "should return false for object with more than 1 properties");
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