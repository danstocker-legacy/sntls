/*global sntls, troop, module, test, ok, equal, strictEqual, deepEqual, notDeepEqual, raises, expect */
(function (Profiled) {
    module("Profiled");

    test("Construction", function () {
        var myClass = troop.Base.extend()
            .addTrait(Profiled)
            .addMethod({
                init: function () {
                    this.initProfiled();
                }
            }),
            myProfiled = myClass.create();

        ok(myProfiled.hasOwnProperty('stats'), "Profiled object has stats");
        ok(myProfiled.stats.isA(sntls.Stats), "Profiled object stats are actually stats");
    });
}(sntls.Profiled));