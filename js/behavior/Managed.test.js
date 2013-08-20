/*global phil, dessert, troop, sntls, module, test, expect, ok, equal, notEqual, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Managed");

    var base = troop.Base.extend()
            .addTrait(sntls.Managed),
        MyManaged = base
            .extend('MyManaged')
            .addMethods({
                init: function () {
                    base.init.call(this);
                }
            });

    test("Registering", function () {
        var myInstance = MyManaged.create(),
            instanceId = myInstance.instanceId,
            result;

        ok(!sntls.Managed.instanceRegistry.getItem(instanceId), "Instance not in registry");

        result = myInstance.addToRegistry();

        strictEqual(result, myInstance, "Registry addition is chainable");
        strictEqual(sntls.Managed.instanceRegistry.getItem(instanceId), myInstance, "Instance stored");

        result = myInstance.removeFromRegistry();
        strictEqual(result, myInstance, "Registry removal is chainable");

        ok(!sntls.Managed.instanceRegistry.getItem(instanceId), "Instance not in registry");
    });

    test("Fetching instance", function () {
        var myInstance = MyManaged.create(),
            instanceId = myInstance.instanceId;

        strictEqual(typeof sntls.Managed.getInstanceById(instanceId), 'undefined', "Fetches nothing");

        myInstance.addToRegistry();

        strictEqual(sntls.Managed.getInstanceById(instanceId), myInstance, "Instance fetched");
    });
}());
