/*global sntls, module, test, ok, equal, strictEqual, notEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Ordered String List");

    test("Conversion from Hash", function () {
        var hash = sntls.Hash.create([]),
            list = hash.toOrderedStringList();

        ok(list.isA(sntls.OrderedStringList), "should return OrderedStringList instance");

        list = hash.toOrderedStringList(sntls.OrderedList.orderTypes.descending);
        equal(list.orderType, sntls.OrderedList.orderTypes.descending,
            "should set orderType property to the specified value");
    });

    test("Conversion from Array", function () {
        var buffer = [1, 2, 3, 4],
            list = buffer.toOrderedStringList();

        ok(list.isA(sntls.OrderedStringList), "should return OrderedStringList instance");
        strictEqual(list.items, buffer, "should retain original buffer");

        list = buffer.toOrderedStringList(sntls.OrderedList.orderTypes.descending);
        equal(list.orderType, sntls.OrderedList.orderTypes.descending,
            "should set orderType property to the specified value");
    });

    test("End value", function () {
        equal(sntls.OrderedStringList._getEndValue('hello'), 'hellp', "should return string with last char changed");
        equal(sntls.OrderedStringList._getEndValue('a'), 'b', "should return next character for single char string");
    });

    test("Next value", function () {
        equal(sntls.OrderedStringList._getNextValue('hello'), 'hello' + String.fromCharCode(0),
            "should append 0 character code to specified string");
    });

    test("String prefix search", function () {
        var orderedStringList = sntls.OrderedStringList.create([
            "animal", "apple", "ant", "bar", "insect", "insert", "item"
        ]);

        raises(function () {
            orderedStringList.getRangeByPrefix("");
        }, "should raise exception on empty string argument");

        deepEqual(
            orderedStringList.getRangeByPrefix("a"),
            ["animal", "ant", "apple"],
            "should return strings matching prefix"
        );

        deepEqual(
            orderedStringList.getRangeByPrefix("an"),
            ["animal", "ant"],
            "should return strings matching prefix"
        );

        deepEqual(
            orderedStringList.getRangeByPrefix("i"),
            ["insect", "insert", "item"],
            "should return strings matching prefix"
        );

        deepEqual(
            orderedStringList.getRangeByPrefix("ins"),
            ["insect", "insert"],
            "should return strings matching prefix"
        );
    });

    test("String prefix search w/ exclusion", function () {
        var orderedStringList = sntls.OrderedStringList.create(["car", "car", "career", "carpet", "foo"]);

        deepEqual(
            orderedStringList.getRangeByPrefix("car", true),
            ["career", "carpet"],
            "should return strings matching prefix, except the prefix itself"
        );
    });

    test("String prefix search w/ offset & limit", function () {
        var orderedStringList = sntls.OrderedStringList.create(["car", "car", "career", "carpet", "foo"]);

        deepEqual(
            orderedStringList.getRangeByPrefix('car', false, 1),
            ["car", "career", "carpet"],
            "should return results with correct offset"
        );

        deepEqual(
            orderedStringList.getRangeByPrefix('car', false, 1, 2),
            ["car", "career"],
            "should return results with correct offset and limit"
        );
    });

    test("String prefix search as hash", function () {
        var orderedStringList = sntls.OrderedStringList.create([
                "animal", "apple", "ant", "bar", "insect", "insert", "item"
            ]),
            result;

        result = orderedStringList.getRangeByPrefixAsHash("a");
        ok(result.isA(sntls.Hash), "should return Hash instance");
        deepEqual(
            result.items,
            ["animal", "ant", "apple"],
            "should return items matching prefix"
        );
    });

    test("Removing all occurrence of a value", function () {
        var orderedStringList = sntls.OrderedStringList.create(["animal", "apple", "apple", "apple", "fruit"]);

        orderedStringList.removeEvery("foo");

        deepEqual(
            orderedStringList.items,
            ["animal", "apple", "apple", "apple", "fruit"],
            "should not alter buffer when value is not present"
        );

        orderedStringList.removeEvery("animal");

        deepEqual(
            orderedStringList.items,
            ["apple", "apple", "apple", "fruit"],
            "should remove specified single element"
        );

        orderedStringList.removeEvery("apple");

        deepEqual(
            orderedStringList.items,
            ["fruit"],
            "should remove all occurrences of specified value"
        );

        orderedStringList.removeEvery("fruit");

        deepEqual(
            orderedStringList.items,
            [],
            "should leave empty buffer after removing last item"
        );
    });
}());
