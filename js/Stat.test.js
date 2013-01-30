/*global sntls, troop, module, test, ok, equal, strictEqual, deepEqual, notDeepEqual, raises, expect */
(function (Stat) {
    module("Stat");

    test("Creation", function () {
        var stat = Stat.create();

        deepEqual(stat.counters, {}, "Counters' initial state");
    });

    test("Increment", function () {
        var stat = Stat.create();

        strictEqual(stat.inc('foo'), stat, "Increment returns self");
        ok(stat.counters.hasOwnProperty('foo'), "New counter added");
        equal(stat.counters.foo, 1, "New counter incremented");

        stat.inc('foo');
        equal(stat.counters.foo, 2, "Counter incremented");
    });

    test("Retrieval", function () {
        var stat = Stat.create();

        stat.inc('foo');
        equal(stat.counter('foo'), stat.counters.foo, "Counter value");
    });
}(sntls.Stat));
