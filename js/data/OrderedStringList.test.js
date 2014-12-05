/*global sntls, module, test, ok, equal, strictEqual, notEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Ordered String List");

    test("Conversion from Hash", function () {
        var hash = sntls.Hash.create([]),
            list = hash.toOrderedStringList();

        ok(list.isA(sntls.OrderedStringList), "Hash converted to OrderedStringList");

        list = hash.toOrderedStringList(sntls.OrderedList.orderTypes.descending);
        equal(list.orderType, sntls.OrderedList.orderTypes.descending,
            "should set orderType property to the specified value");
    });

    test("Conversion from Array", function () {
        var buffer = [1, 2, 3, 4],
            list = buffer.toOrderedStringList();

        ok(list.isA(sntls.OrderedStringList), "Is ordered string list");
        strictEqual(list.items, buffer, "Same buffer");

        list = buffer.toOrderedStringList(sntls.OrderedList.orderTypes.descending);
        equal(list.orderType, sntls.OrderedList.orderTypes.descending,
            "should set orderType property to the specified value");
    });

    test("End value", function () {
        equal(sntls.OrderedStringList._getEndValue('hello'), 'hellp');
        equal(sntls.OrderedStringList._getEndValue('a'), 'b');
    });

    test("Next value", function () {
        equal(sntls.OrderedStringList._getNextValue('hello'), 'hello' + String.fromCharCode(0));
    });

    test("String prefix search", function () {
        var orderedStringList = sntls.OrderedStringList.create(["animal", "apple", "ant", "bar", "insect", "insert",
            "item"]);

        raises(function () {
            orderedStringList.getRangeByPrefix("");
        }, "Empty prefix raises exception");

        deepEqual(
            orderedStringList.getRangeByPrefix("a"),
            ["animal", "ant", "apple"],
            "Prefix 'a'"
        );

        deepEqual(
            orderedStringList.getRangeByPrefix("an"),
            ["animal", "ant"],
            "Prefix 'an'"
        );

        deepEqual(
            orderedStringList.getRangeByPrefix("i"),
            ["insect", "insert", "item"],
            "Prefix 'i'"
        );

        deepEqual(
            orderedStringList.getRangeByPrefix("ins"),
            ["insect", "insert"],
            "Prefix 'ins'"
        );
    });

    test("String prefix search w/ exclusion", function () {
        var orderedStringList = sntls.OrderedStringList.create(["car", "car", "career", "carpet", "foo"]);

        deepEqual(
            orderedStringList.getRangeByPrefix("car", true),
            ["career", "carpet"],
            "All items coming after but matching 'car'"
        );
    });

    test("String prefix search w/ offset & limit", function () {
        var orderedStringList = sntls.OrderedStringList.create(["car", "car", "career", "carpet", "foo"]);

        deepEqual(
            orderedStringList.getRangeByPrefix('car', false, 1),
            ["car", "career", "carpet"],
            "Skipped first item in results"
        );

        deepEqual(
            orderedStringList.getRangeByPrefix('car', false, 1, 2),
            ["car", "career"],
            "Skipped first item and fetched 2 in results"
        );
    });

    test("String prefix search as hash", function () {
        var orderedStringList = sntls.OrderedStringList.create(["animal", "apple", "ant", "bar", "insect", "insert",
                "item"]),
            result;

        result = orderedStringList.getRangeByPrefixAsHash("a");
        ok(result.isA(sntls.Hash), "Hash returned");
        deepEqual(
            result.items,
            ["animal", "ant", "apple"],
            "Search results extracted from hash"
        );
    });

    test("Removing all occurrence of a value", function () {
        var orderedStringList = sntls.OrderedStringList.create(["animal", "apple", "apple", "apple", "fruit"]);

        orderedStringList.removeEvery("foo");

        deepEqual(
            orderedStringList.items,
            ["animal", "apple", "apple", "apple", "fruit"],
            "Removing non-existent doesn't change items"
        );

        orderedStringList.removeEvery("animal");

        deepEqual(
            orderedStringList.items,
            ["apple", "apple", "apple", "fruit"],
            "Removing single occurrence"
        );

        orderedStringList.removeEvery("apple");

        deepEqual(
            orderedStringList.items,
            ["fruit"],
            "Removing multiple occurrences"
        );

        orderedStringList.removeEvery("fruit");

        deepEqual(
            orderedStringList.items,
            [],
            "Removing last value(s)"
        );
    });
}());
