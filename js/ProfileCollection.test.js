/*global sntls, troop, module, test, ok, equal, strictEqual, deepEqual, notDeepEqual, raises, expect */
(function (ProfileCollection, Profile) {
    module("ProfileCollection");

    test("Increment", function () {
        var stats = ProfileCollection.create();

        // adding first profile and incrementing
        stats
            .set('first', Profile.create())
            .inc('foo');

        deepEqual(
            stats.getCount('foo').items,
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
            stats.getCount('foo').items,
            {
                first: 2,
                second: 1
            },
            "Second increment"
        );
    });
}(sntls.ProfileCollection, sntls.Profile));
