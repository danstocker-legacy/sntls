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

    test("Lineage getter", function () {
        var instance = sntls.Progenitor.create()
                .registerLineage('foo'),
            lineage;

        lineage = instance.getLineage('foo');

        ok(lineage.isA(sntls.Lineage), "Lineage fetched");
        equal(lineage.lineageName, 'foo', "Lineage name");
        equal(typeof instance.getLineage('invalid'), 'undefined', "Invalid lineage name");
        strictEqual(instance.getLineage(), lineage, "Default lineage name");
    });

    test("Parent getter", function () {
        var parent = sntls.Progenitor.create()
                .addToLineage('foo'),
            child = sntls.Progenitor.create()
                .addToLineage('foo', parent);

        equal(typeof parent.getParent('foo'), 'undefined', "Ancestor");
        equal(typeof child.getParent('invalid'), 'undefined', "Invalid lineage");
        strictEqual(child.getParent('foo'), parent, "Lineage specified");
        strictEqual(child.getParent(), parent, "Default lineage");
    });

    test("Adding instance to lineage", function () {
        expect(1);

        var myParent = sntls.Progenitor.create()
                .registerLineage('foo'),
            myChild = sntls.Progenitor.create();

        sntls.Lineage.addMocks({
            addToParent: function (parent) {
                strictEqual(parent, myParent);
                return this;
            }
        });

        myChild.addToLineage('foo', myParent);

        sntls.Lineage.removeMocks();
    });

    test("Child addition", function () {
        var parent = sntls.Progenitor.create(),
            child = sntls.Progenitor.create(),
            result;

        result = parent.addChild('foo', child);

        strictEqual(result, parent, "Child addition is chainable");
        ok(parent.getLineage().isA(sntls.Lineage));
        ok(child.getLineage().isA(sntls.Lineage));
    });

    test("Child removal", function () {
        var parent = sntls.Progenitor.create(),
            child = sntls.Progenitor.create();

        parent.addChild('foo', child);

        equal(parent.getLineage().children.getKeyCount(), 1, "Child count before removal");

        parent.removeChild('foo', child);

        equal(parent.getLineage().children.getKeyCount(), 0, "Child count after removal");
        equal(typeof child.getLineage().parent, 'undefined', "Parent reference on child");
    });

    test("Child manipulation integration", function () {
        var parent1 = sntls.Progenitor.create()
                .addToLineage('foo'),
            parent2 = sntls.Progenitor.create()
                .addToLineage('foo'),
            child1 = sntls.Progenitor.create()
                .addToLineage('foo', parent1),
            child2 = sntls.Progenitor.create()
                .addToLineage('foo', parent1),
            child3 = sntls.Progenitor.create()
                .addToLineage('foo', parent1),
            grandchild1 = sntls.Progenitor.create()
                .addToLineage('foo', child1),
            grandchild2 = sntls.Progenitor.create()
                .addToLineage('foo', child1),
            instances = sntls.Collection.create([
                parent1,
                parent2,
                child1,
                child2,
                child3,
                grandchild1,
                grandchild2
            ]);

        deepEqual(
            // lineage paths for all instances
            instances
                .callOnEachItem('getLineage')
                .collectProperty('path')
                .callOnEachItem('toString')
                .getValues()
                .sort(),
            [
                '' + parent1.instanceId,
                '' + parent2.instanceId,
                parent1.instanceId + '>' + child1.instanceId,
                parent1.instanceId + '>' + child2.instanceId,
                parent1.instanceId + '>' + child3.instanceId,
                parent1.instanceId + '>' + child1.instanceId + '>' + grandchild1.instanceId,
                parent1.instanceId + '>' + child1.instanceId + '>' + grandchild2.instanceId
            ].sort(),
            "Lineage paths before removal"
        );

        parent1.removeChild('foo', child1);

        deepEqual(
            // lineage paths for all instances
            instances
                .callOnEachItem('getLineage')
                .collectProperty('path')
                .callOnEachItem('toString')
                .getValues()
                .sort(),
            [
                '' + parent1.instanceId,
                '' + parent2.instanceId,
                '' + child1.instanceId,
                parent1.instanceId + '>' + child2.instanceId,
                parent1.instanceId + '>' + child3.instanceId,
                child1.instanceId + '>' + grandchild1.instanceId,
                child1.instanceId + '>' + grandchild2.instanceId
            ].sort(),
            "Lineage paths after removal"
        );

        parent2.addChild('foo', child1);

        deepEqual(
            // lineage paths for all instances
            instances
                .callOnEachItem('getLineage')
                .collectProperty('path')
                .callOnEachItem('toString')
                .getValues()
                .sort(),
            [
                '' + parent1.instanceId,
                '' + parent2.instanceId,
                parent2.instanceId + '>' + child1.instanceId,
                parent1.instanceId + '>' + child2.instanceId,
                parent1.instanceId + '>' + child3.instanceId,
                parent2.instanceId + '>' + child1.instanceId + '>' + grandchild1.instanceId,
                parent2.instanceId + '>' + child1.instanceId + '>' + grandchild2.instanceId
            ].sort(),
            "Lineage paths after adding to different parent"
        );
    });
}());
