/*global sntls, troop, module, test, ok, equal, strictEqual, deepEqual, notDeepEqual, raises, expect */
(function () {
    "use strict";

    module("Profiled");

    test("Construction", function () {
        var myClass = troop.Base.extend()
                .addTrait(sntls.Profiled)
                .addMethods({
                    init: function () {
                        this.initProfiled('foo');
                    }
                }),
            myProfiled = myClass.create();

        ok(myProfiled.hasOwnProperty('profile'), "Profiled object has stats");
        ok(myProfiled.profile.isA(sntls.ProfileCollection), "Profiled object stats are actually stats");

        equal(myProfiled.profile.getKeyCount(), 1, "New profile collection contains 1 element");
        deepEqual(myProfiled.profile.getKeys(), ['foo'], "Instance IDs in profile");
    });

    test("Profile getter", function () {
        var myClass = troop.Base.extend()
                .addTrait(sntls.Profiled)
                .addMethods({
                    init: function () {
                        this.initProfiled('foo');
                    }
                }),
            myProfiled = myClass.create();

        strictEqual(myProfiled.getProfile(), myProfiled.profile, "Profile getter");
    });
}());
