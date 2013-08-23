/*global phil, dessert, troop, sntls, module, test, expect, ok, equal, notEqual, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Progenitor");

    var MyProgenitor = troop.Base.extend()
        .addTrait(sntls.Progenitor)
        .extend('MyProgenitor')
        .addMethods({
            init: function () {
                sntls.Progenitor.init.call(this);
            }
        });

    test("Instantiation", function () {
        var myInstance = /** @type sntls.Progenitor */ MyProgenitor.create();
        ok(myInstance.lineages.isA(sntls.Collection), "Lineages collection");
        ok(myInstance.children.isA(sntls.Collection), "Children collection");
    });

    test("Adding to lineage", function () {
        var parent = /** @type sntls.Progenitor */ MyProgenitor.create(),
            child = /** @type sntls.Progenitor */ MyProgenitor.create();

        equal(parent.lineages.getKeyCount(), 0, "No lineages up front");
        equal(parent.children.getKeyCount(), 0, "No children up front");

        parent.addToLineage('foo');

        deepEqual(parent.lineages.getKeys(), ['foo'], "Lineage names");
        ok(parent.lineages.getItem('foo').isA(sntls.Path), "Lineage is a path");
        deepEqual(parent.lineages.getItem('foo').asArray, [parent.instanceId], "Specific lineage");

        child.addToLineage('foo', parent);

        deepEqual(child.lineages.getKeys(), ['foo'], "Lineage names");
        ok(child.lineages.getItem('foo').isA(sntls.Path), "Lineage is a path");
        deepEqual(child.lineages.getItem('foo').asArray, [parent.instanceId, child.instanceId], "Specific lineage");

        equal(parent.children.getKeyCount(), 1, "Number of children on parent instance");
        strictEqual(parent.children.getItem(child.instanceId), child, "Child assigned to parent");
    });

    test("Removal from lineage", function () {
        var parent = /** @type sntls.Progenitor */ MyProgenitor.create()
                .addToLineage('foo'),
            child = /** @type sntls.Progenitor */ MyProgenitor.create()
                .addToLineage('foo', parent);

        deepEqual(parent.lineages.getItem('foo').asArray, [parent.instanceId], "Specific lineage");
        equal(parent.children.getKeyCount(), 1, "Number of children before removal");

        child.removeFromLineage('foo');

        equal(parent.children.getKeyCount(), 0, "No children left after removal");

        parent.removeFromLineage('foo');

        equal(parent.lineages.getKeyCount(), 0, "No lineages after removal");
    });

    test("Parent assessment", function () {
        var parent = /** @type sntls.Progenitor */ MyProgenitor.create()
                .addToLineage('foo'),
            child = /** @type sntls.Progenitor */ MyProgenitor.create()
                .addToLineage('foo', parent);

        equal(typeof parent.getParent('foo'), 'undefined', "Ancestor");
        equal(typeof child.getParent('invalid'), 'undefined', "Invalid lineage");
        strictEqual(child.getParent('foo'), parent, "Lineage specified");
        strictEqual(child.getParent(), parent, "Default lineage");
    });
}());
