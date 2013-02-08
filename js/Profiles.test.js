/*global sntls, troop, module, test, ok, equal, strictEqual, deepEqual, notDeepEqual, raises, expect */
(function (Profiles, Profile) {
    module("Profiles");

    test("Increment", function () {
        var stats = Profiles.create();

        // adding first profile and incrementing
        stats
            .set('first', Profile.create())
            .inc('foo');

        deepEqual(
            stats.counter('foo').items,
            {
                first: 1
            },
            "First increment"
        );

        // adding new profile and incrementing all
        stats
            .set('second', Profile.create())
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
}(sntls.Profiles, sntls.Profile));
