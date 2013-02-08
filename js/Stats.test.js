/*global sntls, troop, module, test, ok, equal, strictEqual, deepEqual, notDeepEqual, raises, expect */
(function (Stats, Stat) {
    module("Stats");

    test("Increment", function () {
        var stats = Stats.create();

        // adding first statistic and incrementing
        stats
            .set('first', Stat.create())
            .inc('foo');

        deepEqual(
            stats.counter('foo').items,
            {
                first: 1
            },
            "First increment"
        );

        // adding new statistic and incrementing all
        stats
            .set('second', Stat.create())
            .inc('foo');

        deepEqual(
            stats.counter('foo').items,
            {
                first: 2,
                second: 1
            },
            "Second increment"
        );
    });
}(sntls.Stats, sntls.Profile));
