/*global sntls, module, test, ok, equal, strictEqual, notEqual, deepEqual, raises */
(function (OrderedArray) {
    module("Ordered Array");

    test("Instantiation w/o items", function () {
        var orderedArray = OrderedArray.create();
        ok(orderedArray.items instanceof Array, "Items array created");
        equal(orderedArray.items.length, 0, "New items array is empty");
    });

    test("Instantiation w/ items", function () {
        var items = [2, 3, 1, 4],
            orderedArray = OrderedArray.create(items);
        strictEqual(orderedArray.items, items, "Items array retained");
        deepEqual(orderedArray.items, [1, 2, 3, 4], "Items array ordered");
    });

    test("Numeric search", function () {
        var orderedArray = OrderedArray.create([0, 1, 3, 5, 6, 9]);
        equal(orderedArray.indexOf(4), 3, "Lower nearest hit");
        equal(orderedArray.indexOf(6), 4, "Exact hit");
        equal(orderedArray.indexOf(0), 0, "Low extreme");
        equal(orderedArray.indexOf(9), 5, "High extreme");
        equal(orderedArray.indexOf(-4), 0, "Lower out of bounds");
        equal(orderedArray.indexOf(100), 5, "Upper out of bounds");
    });

    test("Numeric search in 1-item array", function () {
        var orderedArray = OrderedArray.create([4]);
        equal(orderedArray.indexOf(4), 0, "Exact hit");
        equal(orderedArray.indexOf(-4), 0, "Lower out of bounds");
        equal(orderedArray.indexOf(100), 0, "Upper out of bounds");
    });

    test("Numeric search in empty array", function () {
        var orderedArray = OrderedArray.create([]);
        equal(orderedArray.indexOf(4), 0, "Out of bounds");
    });

    test("String search", function () {
        /**
         * @type {sntls.OrderedArray}
         */
        var orderedArray;

        orderedArray = OrderedArray.create(["bar", "foo", "hello", "ipsum", "lorem", "world"]);
        equal(orderedArray.indexOf('hell'), 2, "Lower nearest hit");
        equal(orderedArray.indexOf('hello'), 2, "Exact hit");
        equal(orderedArray.indexOf('hew'), 3, "Upper nearest hit");
        equal(orderedArray.indexOf('bar'), 0, "Low extreme");
        equal(orderedArray.indexOf('world'), 5, "High extreme");
        equal(orderedArray.indexOf('ant'), 0, "Lower out of bounds");
        equal(orderedArray.indexOf('wound'), 5, "Upper out of bounds");
    });
}(sntls.OrderedArray ));
