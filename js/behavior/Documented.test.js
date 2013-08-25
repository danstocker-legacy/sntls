/*global phil, dessert, troop, sntls, module, test, expect, ok, equal, notEqual, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Documented");

    test("Instantiation", function () {
        raises(function () {
            troop.Base.extend()
                .addTrait(sntls.Documented)
                .extend();
        }, "Invalid class name");

        var MyDocumented = troop.Base.extend()
                .addTrait(sntls.Documented)
                .extend('MyDocumented')
                .addMethods({
                    init: function () { sntls.Documented.init.call(this); }
                }),
            nextInstanceId = sntls.Documented.nextInstanceId,
            myInstance;

        equal(MyDocumented.className, 'MyDocumented', "Class name");

        myInstance = MyDocumented.create();

        equal(myInstance.instanceId, nextInstanceId, "Assigned instance ID");

        equal(sntls.Documented.nextInstanceId, nextInstanceId + 1, "Incremented instance ID");
    });
}());
