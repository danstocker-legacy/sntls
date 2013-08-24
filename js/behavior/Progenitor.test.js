/*global phil, dessert, troop, sntls, module, test, expect, ok, equal, notEqual, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Progenitor");

    test("Instantiation", function () {
        var instance = sntls.Progenitor.create();
        ok(instance.lineages.isA(sntls.Collection), "Lineages collection");
    });

    test("Lineage registration", function () {
        var instance = sntls.Progenitor.create();

        equal(instance.lineages.getKeyCount(), 0, "No lineages up front");

        instance.registerLineage('foo');

        equal(instance.lineages.getKeyCount(), 1, "Lineage count increased");
        equal(instance.lineages.getFirstKey(), 'foo', "Lineage added");
        ok(instance.lineages.getFirstValue().isA(sntls.Lineage), "Lineage added");
        equal(instance.lineages.getFirstValue().lineageName, 'foo', "Lineage name");
    });

    test("Adding instance to lineage", function () {
        expect(1);

        var myParent = sntls.Progenitor.create()
                .registerLineage('foo'),
            myChild = sntls.Progenitor.create();

        sntls.Lineage.addMocks({
            setParent: function (parent) {
                strictEqual(parent, myParent);
                return this;
            }
        });

        myChild.addToLineage('foo', myParent);

        sntls.Lineage.removeMocks();
    });

    test("Parent assessment", function () {
        var parent = sntls.Progenitor.create()
                .addToLineage('foo'),
            child = sntls.Progenitor.create()
                .addToLineage('foo', parent);

        equal(typeof parent.getParent('foo'), 'undefined', "Ancestor");
        equal(typeof child.getParent('invalid'), 'undefined', "Invalid lineage");
        strictEqual(child.getParent('foo'), parent, "Lineage specified");
        strictEqual(child.getParent(), parent, "Default lineage");
    });
}());
