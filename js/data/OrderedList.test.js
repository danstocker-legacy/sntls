/*global sntls, module, test, ok, equal, strictEqual, notEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Ordered List");

    test("Instantiation w/o items", function () {
        raises(function () {
            sntls.OrderedList.create('foo');
        }, "should raise exception on invalid arguments");

        raises(function () {
            sntls.OrderedList.create([], 'foo');
        }, "should raise exception on invalid arguments");

        var orderedList = sntls.OrderedList.create();
        ok(orderedList.items instanceof Array, "should add array buffer");
        equal(orderedList.items.length, 0, "should initialize array buffer to empty");
        equal(orderedList.orderType, orderedList.orderTypes.ascending, "should set default orderType property");
    });

    test("Instantiation ascending order", function () {
        var items = [2, 3, 1, 4],
            orderedList = sntls.OrderedList.create(items);
        strictEqual(orderedList.items, items, "should retain original buffer");
        deepEqual(orderedList.items, [1, 2, 3, 4], "should sort buffer contents in ascending order");
        equal(orderedList.orderType, orderedList.orderTypes.ascending, "should set default orderType property");
    });

    test("Instantiation descending order", function () {
        var items = [2, 3, 1, 4],
            orderedList = sntls.OrderedList.create(items, 'descending');
        strictEqual(orderedList.items, items, "should retain original buffer");
        deepEqual(orderedList.items, [4, 3, 2, 1], "should sort buffer contents in descending order");
        equal(orderedList.orderType, orderedList.orderTypes.descending, "should set orderType to descending");
    });

    test("Conversion from Hash", function () {
        var hash, list;

        hash = sntls.Hash.create();

        raises(function () {
            hash.toOrderedList();
        }, "Hash buffer is not array");

        hash = sntls.Hash.create([]);
        list = hash.toOrderedList();

        ok(list.isA(sntls.OrderedList), "should return OrderedList instance");

        list = hash.toOrderedList(sntls.OrderedList.orderTypes.descending);
        equal(list.orderType, sntls.OrderedList.orderTypes.descending, "should set specified order type");
    });

    test("Conversion from Array", function () {
        var buffer = [1, 2, 3, 4],
            list;

        list = buffer.toOrderedList();
        ok(list.isA(sntls.OrderedList), "should return OrderedList");
        strictEqual(list.items, buffer, "should retain original array as buffer");

        list = list.toOrderedList(sntls.OrderedList.orderTypes.descending);
        equal(list.orderType, sntls.OrderedList.orderTypes.descending, "should set specified order type");
    });

    test("Numeric search in ascending order", function () {
        var orderedList = sntls.OrderedList.create([0, 1, 3, 5, 6, 9]);
        equal(orderedList.spliceIndexOf(4), 3, "should return index of upper closest item for no exact hit");
        equal(orderedList.spliceIndexOf(6), 4, "should return index of specified value on exact hit");
        equal(orderedList.spliceIndexOf(0), 0, "should return 0 for lower extreme");
        equal(orderedList.spliceIndexOf(9), 5, "should return last index for upper extreme");
        equal(orderedList.spliceIndexOf(-4), 0, "should return 0 for lower out-of-bounds");
        equal(orderedList.spliceIndexOf(100), 6, "should return length for upper out-of-bounds");
    });

    test("Numeric search in descending order", function () {
        var orderedList = sntls.OrderedList.create([9, 6, 5, 3, 1, 0], 'descending');
        equal(orderedList.spliceIndexOf(4), 3, "should return index of lower closest item for no exact hit");
        equal(orderedList.spliceIndexOf(6), 1, "should return index of specified value on exact hit");
        equal(orderedList.spliceIndexOf(0), 5, "should return last index for lower extreme");
        equal(orderedList.spliceIndexOf(9), 0, "should return 0 for upper extreme");
        equal(orderedList.spliceIndexOf(-4), 6, "should return length  for lower out-of-bounds");
        equal(orderedList.spliceIndexOf(100), 0, "should return 0 for upper out-of-bounds");
    });

    test("Numeric search in 1-item list", function () {
        var orderedList = sntls.OrderedList.create([4]);
        equal(orderedList.spliceIndexOf(4), 0, "should return 0 for exact hit");
        equal(orderedList.spliceIndexOf(-4), 0, "should return 0 for lower out-of-bounds");
        equal(orderedList.spliceIndexOf(100), 1, "should return 1 for upper out-of-bounds");
    });

    test("Numeric search in empty list", function () {
        var orderedList = sntls.OrderedList.create();
        equal(orderedList.spliceIndexOf(4), 0, "should return 0 for upper out-of-bounds");
    });

    test("String search in ascending order", function () {
        var orderedList = sntls.OrderedList.create(["bar", "foo", "hello", "ipsum", "lorem", "world"]);
        equal(orderedList.spliceIndexOf('hell'), 2, "should return index of upper closest item for no exact hit");
        equal(orderedList.spliceIndexOf('hew'), 3, "should return index of upper closest item for no exact hit");
        equal(orderedList.spliceIndexOf('hello'), 2, "should return index of specified value on exact hit");
        equal(orderedList.spliceIndexOf('bar'), 0, "should return 0 for lower extreme");
        equal(orderedList.spliceIndexOf('world'), 5, "should return last index for upper extreme");
        equal(orderedList.spliceIndexOf('ant'), 0, "should return 0 for lower out-of-bounds");
        equal(orderedList.spliceIndexOf('wound'), 6, "should return length for upper out-of-bounds");
    });

    test("String search in descending order", function () {
        var orderedList = sntls.OrderedList.create(["world", "lorem", "ipsum", "hello", "foo", "bar"], 'descending');
        equal(orderedList.spliceIndexOf('hell'), 4, "should return index of lower closest item for no exact hit");
        equal(orderedList.spliceIndexOf('hew'), 3, "should return index of lower closest item for no exact hit");
        equal(orderedList.spliceIndexOf('hello'), 3, "should return index of specified value on exact hit");
        equal(orderedList.spliceIndexOf('bar'), 5, "should return last index for lower extreme");
        equal(orderedList.spliceIndexOf('world'), 0, "should return 0 for upper extreme");
        equal(orderedList.spliceIndexOf('ant'), 6, "should return length for lower out-of-bounds");
        equal(orderedList.spliceIndexOf('wound'), 0, "should return 0 for upper out-of-bounds");
    });

    test("Search with repeating items", function () {
        var orderedList = sntls.OrderedList.create(["bar", "foo", "foo", "foo", "hello", "hello", "world"]);
        equal(orderedList.spliceIndexOf('foo'), 1, "should return index of first matching item");
        equal(orderedList.spliceIndexOf('foo!'), 4, "should return index of upper closest item for non-exact hit");
        equal(orderedList.spliceIndexOf('hello'), 4, "should return index of first matching item");
        equal(orderedList.spliceIndexOf('hello!'), 6, "should return index of upper closest item for non-exact hit");
    });

    test("Range retrieval in ascending order", function () {
        var orderedList = sntls.OrderedList.create(["bar", "foo", "hello", "ipsum", "lorem", "world"]);

        deepEqual(
            orderedList.getRange("bar", "lorem"),
            ["bar", "foo", "hello", "ipsum"],
            "should include matching lower bound but exclude matching upper bound"
        );

        deepEqual(
            orderedList.getRange("bar", "hi"),
            ["bar", "foo", "hello"],
            "should include matching lower bound and all items up to non-matching bound"
        );

        deepEqual(
            orderedList.getRange("hell", "random"),
            ["hello", "ipsum", "lorem"],
            "should include all items between non-matching bounds"
        );

        deepEqual(
            orderedList.getRange("hello", "wound"),
            ["hello", "ipsum", "lorem", "world"],
            "should include all items from lower bound for out-of bounds upper bound"
        );

        deepEqual(
            orderedList.getRange("ant", "hell"),
            ["bar", "foo"],
            "should include all items from upper bound for out-of bounds lower bound"
        );
    });

    test("Range retrieval in descending order", function () {
        var orderedList = sntls.OrderedList.create(["world", "lorem", "ipsum", "hello", "foo", "bar"], 'descending');

        deepEqual(
            orderedList.getRange("lorem", "bar"),
            ["lorem", "ipsum", "hello", "foo"],
            "should include matching upper bound but exclude matching lower bound"
        );
    });

    test("Range retrieval with repetition", function () {
        var orderedList = sntls.OrderedList.create(["bar", "foo", "foo", "foo", "world"]);

        deepEqual(
            orderedList.getRange("bar", "lorem"),
            ["bar", "foo", "foo", "foo"],
            "should include repeating items that fall within bounds"
        );

        deepEqual(
            orderedList.getRange("foo", "fooo"),
            ["foo", "foo", "foo"],
            "should include only the repeating items for matching lower bound & next non-matching upper bound"
        );
    });

    test("Range retrieval with offset & limit", function () {
        var orderedList = sntls.OrderedList.create(["bar", "foo", "foo", "foo", "world"]);

        deepEqual(
            orderedList.getRange("bar", "lorem", 2),
            ["foo", "foo"],
            "should exclude starting items as specified by offset"
        );

        deepEqual(
            orderedList.getRange("bar", "lorem", 2, 3),
            ["foo", "foo"],
            "should exclude starting items, and include no more than limit"
        );

        deepEqual(
            orderedList.getRange("bar", "lorem", 2, 1),
            ["foo"],
            "should exclude starting items, and include at most limit"
        );
    });

    test("Range retrieval as hash", function () {
        var orderedList = sntls.OrderedList.create(["bar", "foo", "foo", "foo", "world"]),
            result;

        result = orderedList.getRangeAsHash("bar", "lorem");

        ok(result.isA(sntls.Hash), "should return Hash instance");
        deepEqual(
            result.items,
            ["bar", "foo", "foo", "foo"],
            "should return expected results in Hash buffer"
        );
    });

    test("Item addition in ascending order", function () {
        var orderedList = sntls.OrderedList.create(["bar", "foo", "hello", "ipsum", "lorem", "world"]),
            result;

        result = orderedList.addItem('hell');

        equal(result, 2, "should return index of insertion");
        deepEqual(
            orderedList.items,
            ["bar", "foo", "hell", "hello", "ipsum", "lorem", "world"],
            "should insert item at the correct index"
        );

        result = orderedList.addItem('wound');

        equal(result, 7, "should return index of insertion");
        deepEqual(
            orderedList.items,
            ["bar", "foo", "hell", "hello", "ipsum", "lorem", "world", "wound"],
            "should insert out-of-bound item at after last index"
        );
    });

    test("Item addition in descending order", function () {
        var orderedList = sntls.OrderedList.create(["world", "lorem", "ipsum", "hello", "foo", "bar"], 'descending'),
            result;

        result = orderedList.addItem('hell');

        equal(result, 4, "should return index of insertion");
        deepEqual(
            orderedList.items,
            ["world", "lorem", "ipsum", "hello", "hell", "foo", "bar"],
            "should insert item at the correct index"
        );
    });

    test("Multiple item addition", function () {
        var orderedList = sntls.OrderedList.create(),
            result;

        result = orderedList.addItems(['c', 'a', 'b']);

        equal(result, orderedList, "should be chainable");
        deepEqual(
            orderedList.items,
            ['a', 'b', 'c'],
            "should add all specified items"
        );
    });

    test("Item removal in ascending order", function () {
        var orderedList = sntls.OrderedList.create(["bar", "foo", "hello", "ipsum", "lorem", "world"]),
            result;

        result = orderedList.removeItem('hell');

        equal(result, -1, "should return -1 on absent item");
        deepEqual(
            orderedList.items,
            ["bar", "foo", "hello", "ipsum", "lorem", "world"],
            "should not change buffer when trying to remove absent item"
        );

        result = orderedList.removeItem('hello');

        equal(result, 2, "should return index of removed item");
        deepEqual(
            orderedList.items,
            ["bar", "foo", "ipsum", "lorem", "world"],
            "should remove specified item from buffer"
        );
    });

    test("Item removal in descending order", function () {
        var orderedList = sntls.OrderedList.create(["world", "lorem", "ipsum", "hello", "foo", "bar"], 'descending'),
            result;

        result = orderedList.removeItem('hello');

        equal(result, 3, "should return index of removed item");
        deepEqual(
            orderedList.items,
            ["world", "lorem", "ipsum", "foo", "bar"],
            "should remove specified item from buffer"
        );
    });

    test("Multiple item removal", function () {
        var orderedList = sntls.OrderedList.create(['ahoy', 'a', 'b', 'cool', 'c']),
            result;

        result = orderedList.removeItems(['c', 'a', 'b']);

        equal(result, orderedList, "should be chainable");
        deepEqual(
            orderedList.items,
            ['ahoy', 'cool'],
            "should remove specified items from buffer"
        );
    });

    test("Range removal in ascending order", function () {
        var orderedList = sntls.OrderedList.create(["bar", "foo", "hello", "ipsum", "lorem", "world"]),
            result;

        result = orderedList.removeRange("for", "fun");

        equal(result, -1, "should return -1 when no items have been removed");
        deepEqual(
            orderedList.items,
            ["bar", "foo", "hello", "ipsum", "lorem", "world"],
            "should not change buffer when range matched no items"
        );

        result = orderedList.removeRange("foo", "in");

        equal(result, 1, "should return index of first removed item");
        deepEqual(
            orderedList.items,
            ["bar", "ipsum", "lorem", "world"],
            "should remove specified range from buffer"
        );

        result = orderedList.removeRange("ipsum", "lorem");

        equal(result, 1, "should return index of first removed item");
        deepEqual(
            orderedList.items,
            ["bar", "lorem", "world"],
            "should remove all items form (included) start to end (excluded) of range"
        );
    });

    test("Range removal in descending order", function () {
        var orderedList = sntls.OrderedList.create(["world", "lorem", "ipsum", "hello", "foo", "bar"], 'descending'),
            result;

        result = orderedList.removeRange("in", "foo");

        equal(result, 3, "should return index of first removed item");
        deepEqual(
            orderedList.items,
            ["world", "lorem", "ipsum", "foo", "bar"],
            "should remove specified range from buffer"
        );
    });

    test("Cloning", function () {
        var orderedList = ["world", "lorem", "ipsum", "hello", "foo", "bar"].toOrderedList('descending'),
            cloneOrderedList = orderedList.clone();

        deepEqual(cloneOrderedList.items, orderedList.items, "should set items buffer in clone");
        equal(cloneOrderedList.keyCount, orderedList.keyCount, "should set item count in clone");
        equal(cloneOrderedList.orderType, orderedList.orderType, "should set order type");
    });
}());
