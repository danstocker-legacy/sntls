/*global sntls, module, test, ok, equal, strictEqual, notEqual, deepEqual, raises */
(function () {
    module("Ordered String List");

    test("End value", function () {
        equal(sntls.OrderedStringList._getEndValue('hello'), 'hellp');
        equal(sntls.OrderedStringList._getEndValue('a'), 'b');
    });

    test("String prefix search", function () {
        var orderedStringList = /** @type {sntls.OrderedStringList} */
            sntls.OrderedStringList.create(["animal", "apple", "ant", "bar", "insect", "insert", "item"]);

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
}());
