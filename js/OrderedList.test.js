/*global sntls, module, test, ok, equal, strictEqual, notEqual, deepEqual, raises */
(function () {
    module("Ordered List");

    test("Instantiation w/o items", function () {
        var orderedList = /** @type {sntls.OrderedList} */ sntls.OrderedList.create();
        ok(orderedList.items instanceof Array, "Items array created");
        equal(orderedList.items.length, 0, "New items array is empty");
    });

    test("Instantiation w/ items", function () {
        var items = [2, 3, 1, 4],
            orderedList = /** @type {sntls.OrderedList} */ sntls.OrderedList.create(items);
        strictEqual(orderedList.items, items, "Items array retained");
        deepEqual(orderedList.items, [1, 2, 3, 4], "Items array ordered");
    });

    test("Numeric search", function () {
        var orderedList = /** @type {sntls.OrderedList} */ sntls.OrderedList.create([0, 1, 3, 5, 6, 9]);
        equal(orderedList.spliceIndexOf(4), 3, "Lower nearest hit");
        equal(orderedList.spliceIndexOf(6), 4, "Exact hit");
        equal(orderedList.spliceIndexOf(0), 0, "Low extreme");
        equal(orderedList.spliceIndexOf(9), 5, "High extreme");
        equal(orderedList.spliceIndexOf(-4), 0, "Lower out of bounds");
        equal(orderedList.spliceIndexOf(100), 6, "Upper out of bounds");
    });

    test("Numeric search in 1-item list", function () {
        var orderedList = /** @type {sntls.OrderedList} */ sntls.OrderedList.create([4]);
        equal(orderedList.spliceIndexOf(4), 0, "Exact hit");
        equal(orderedList.spliceIndexOf(-4), 0, "Lower out of bounds");
        equal(orderedList.spliceIndexOf(100), 1, "Upper out of bounds");
    });

    test("Numeric search in empty list", function () {
        var orderedList = /** @type {sntls.OrderedList} */ sntls.OrderedList.create([]);
        equal(orderedList.spliceIndexOf(4), 0, "Out of bounds");
    });

    test("String search", function () {
        var orderedList = /** @type {sntls.OrderedList} */
            sntls.OrderedList.create(["bar", "foo", "hello", "ipsum", "lorem", "world"]);
        equal(orderedList.spliceIndexOf('hell'), 2, "Lower nearest hit");
        equal(orderedList.spliceIndexOf('hello'), 2, "Exact hit");
        equal(orderedList.spliceIndexOf('hew'), 3, "Upper nearest hit");
        equal(orderedList.spliceIndexOf('bar'), 0, "Low extreme");
        equal(orderedList.spliceIndexOf('world'), 5, "High extreme");
        equal(orderedList.spliceIndexOf('ant'), 0, "Lower out of bounds");
        equal(orderedList.spliceIndexOf('wound'), 6, "Upper out of bounds");
    });

    test("Range", function () {
        var orderedList = /** @type {sntls.OrderedList} */
            sntls.OrderedList.create(["bar", "foo", "hello", "ipsum", "lorem", "world"]);

        deepEqual(
            orderedList.getRange("bar", "lorem"),
            ["bar", "foo", "hello", "ipsum"],
            "Existing edges"
        );

        deepEqual(
            orderedList.getRange("bar", "hi"),
            ["bar", "foo", "hello"],
            "Non-existing upper edge"
        );

        deepEqual(
            orderedList.getRange("hell", "random"),
            ["hello", "ipsum", "lorem"],
            "Both edges non-existing"
        );

        deepEqual(
            orderedList.getRange("hello", "wound"),
            ["hello", "ipsum", "lorem", "world"],
            "Out of bounds upper edge"
        );

        deepEqual(
            orderedList.getRange("ant", "hell"),
            ["bar", "foo"],
            "Out of bounds lower edge"
        );
    });

    test("Item addition", function () {
        var orderedList = /** @type {sntls.OrderedList} */
            sntls.OrderedList.create(["bar", "foo", "hello", "ipsum", "lorem", "world"]),
            result;

        result = orderedList.addItem('hell');

        equal(result, 2, "Added at #2");
        deepEqual(
            orderedList.items,
            ["bar", "foo", "hell", "hello", "ipsum", "lorem", "world"],
            "Inserted 'hell'"
        );

        result = orderedList.addItem('wound');

        equal(result, 7, "Added at #7");
        deepEqual(
            orderedList.items,
            ["bar", "foo", "hell", "hello", "ipsum", "lorem", "world", "wound"],
            "Inserted 'wound'"
        );
    });

    test("Item removal", function () {
        var orderedList = /** @type {sntls.OrderedList} */ sntls.OrderedList.create(["bar", "foo", "hello", "ipsum",
            "lorem", "world"]),
            result;

        result = orderedList.removeItem('hell');

        equal(result, -1, "Not found in list");
        deepEqual(
            orderedList.items,
            ["bar", "foo", "hello", "ipsum", "lorem", "world"],
            "Attempted to remove 'hell'"
        );

        result = orderedList.removeItem('hello');

        equal(result, 2, "Removed from #2");
        deepEqual(
            orderedList.items,
            ["bar", "foo", "ipsum", "lorem", "world"],
            "Removed 'hello'"
        );
    });

    test("List clear", function () {
        var orderedList = /** @type {sntls.OrderedList} */ sntls.OrderedList.create(["bar", "foo", "hello", "ipsum",
            "lorem", "world"]),
            result;

        result = orderedList.clear();

        strictEqual(result, orderedList, "Clear is chainable");
        deepEqual(
            orderedList.items,
            [],
            "Cleared list"
        );
    });
}());