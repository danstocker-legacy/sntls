/*global sntls, module, test, ok, equal, strictEqual, notEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Ordered String List");

    test("Type conversion", function () {
        var hash = sntls.Hash.create([]),
            list = hash.toOrderedStringList();

        ok(list.isA(sntls.OrderedStringList), "Hash converted to OrderedStringList");
    });

    test("End value", function () {
        equal(sntls.OrderedStringList._getEndValue('hello'), 'hellp');
        equal(sntls.OrderedStringList._getEndValue('a'), 'b');
    });

    test("Next value", function () {
        equal(sntls.OrderedStringList._getNextValue('hello'), 'hello' + String.fromCharCode(0));
    });

    test("String prefix search", function () {
        var orderedStringList = sntls.OrderedStringList.create(["animal", "apple", "ant", "bar", "insect", "insert", "item"]);

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

    test("Removing all occurrence of a value", function () {
        var orderedStringList = sntls.OrderedStringList.create(["animal", "apple", "apple", "apple", "fruit"]);

        orderedStringList.removeAll("foo");

        deepEqual(
            orderedStringList.items,
            ["animal", "apple", "apple", "apple", "fruit"],
            "Removing non-existent doesn't change items"
        );

        orderedStringList.removeAll("animal");

        deepEqual(
            orderedStringList.items,
            ["apple", "apple", "apple", "fruit"],
            "Removing single occurrence"
        );

        orderedStringList.removeAll("apple");

        deepEqual(
            orderedStringList.items,
            ["fruit"],
            "Removing multiple occurrences"
        );

        orderedStringList.removeAll("fruit");

        deepEqual(
            orderedStringList.items,
            [],
            "Removing last value(s)"
        );
    });
}());
