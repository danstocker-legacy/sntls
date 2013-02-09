/*global sntls, troop, module, test, ok, equal, strictEqual, deepEqual, notDeepEqual, raises, expect */
(function (Profiled) {
    module("Profiled");

    test("Construction", function () {
        var myClass = troop.Base.extend()
            .addTrait(Profiled)
            .addMethod({
                init: function () {
                    this.initProfiled('foo');
                }
            }),
            myProfiled = myClass.create();

        ok(myProfiled.hasOwnProperty('profile'), "Profiled object has stats");
        ok(myProfiled.profile.isA(sntls.Profiles), "Profiled object stats are actually stats");

        equal(myProfiled.profile.count, 1, "New profile collection contains 1 element");
        deepEqual(myProfiled.profile.keys(), ['foo'], "Instance IDs in profile");
    });
}(sntls.Profiled));
