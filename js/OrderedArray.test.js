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
        var orderedArray;

        orderedArray = OrderedArray.create([0, 1, 3, 5, 6, 9]);
        equal(orderedArray.indexOf(4), 2, "Position of 4 (nearest hit)");
        equal(orderedArray.indexOf(6), 4, "Position of 6 (exact hit)");
        equal(orderedArray.indexOf(0), 0, "Position of 1 (low extreme)");
        equal(orderedArray.indexOf(9), 5, "Position of 9 (high extreme)");
        equal(orderedArray.indexOf(-4), 0, "Position of -4 (out of bounds -)");
        equal(orderedArray.indexOf(100), 5, "Position of 100 (out of bounds +)");

        // extreme case, only 1 element
        orderedArray = OrderedArray.create([4]);
        equal(orderedArray.indexOf(4), 0, "Position of 4 in 1-elem buffer (exact hit)");
        equal(orderedArray.indexOf(-4), 0, "Position of -4 in 1-elem buffer (out of bounds -)");
        equal(orderedArray.indexOf(100), 0, "Position of 100 in 1-elem buffer (out of bounds +)");

        // extreme case, zero elements
        orderedArray = OrderedArray.create([]);
        equal(orderedArray.indexOf(4), 0, "Position of 4 in empty");
    });
}(sntls.OrderedArray ));
