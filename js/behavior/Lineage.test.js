/*global phil, dessert, troop, sntls, module, test, expect, ok, equal, notEqual, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Lineage");

    test("Instantiation", function () {
        raises(function () {
            sntls.Lineage.create(111, instance);
        }, "Invalid lineage name");

        raises(function () {
            sntls.Lineage.create('foo', 'invalid');
        }, "Invalid instance");

        var instance = sntls.Documented.create(),
            lineage = /** @type sntls.Lineage */ sntls.Lineage.create('foo', instance);

        equal(lineage.lineageName, 'foo', "Lineage name");
        ok(lineage.path.isA(sntls.Path), "Lineage path");
        deepEqual(lineage.path.asArray, [instance.instanceId.toString()], "Lineage path contents");
        ok(lineage.children.isA(sntls.Collection), "Children collection");
        equal(lineage.children.getKeyCount(), 0, "Children collection empty");
        equal(typeof lineage.parent, 'undefined', "Parent reference");
    });

    test("Simple parent setting", function () {
        var parent = sntls.Progenitor.create()
                .registerLineage('foo'),
            parentLineage = parent.getLineage('foo'),
            child = sntls.Progenitor.create()
                .registerLineage('foo'),
            childLineage = child.getLineage('foo');

        raises(function () {
            childLineage.addToParent('invalid');
        }, "Invalid parent");

        childLineage.addToParent(parent);

        var expectedChildren = {};
        expectedChildren[child.instanceId] = child;

        deepEqual(childLineage.path.asArray, [parent.instanceId.toString(), child.instanceId.toString()], "Lineage path contents");
        deepEqual(parentLineage.children.items, expectedChildren, "Parent's children");
        strictEqual(childLineage.parent, parent, "Parent reference");
    });

    test("Simple parent removal", function () {
        var parent = sntls.Progenitor.create()
                .addToLineage('foo'),
            parentLineage = parent.getLineage('foo'),
            child = sntls.Progenitor.create()
                .addToLineage('foo', parent),
            childLineage = child.getLineage('foo');

        deepEqual(childLineage.path.asArray, [parent.instanceId.toString(), child.instanceId.toString()], "Lineage path before removal");
        deepEqual(parentLineage.children.getKeyCount(), 1, "Parent's children count before removal");
        strictEqual(childLineage.parent, parent, "Parent reference before removal");

        childLineage.removeFromParent();

        deepEqual(childLineage.path.asArray, [child.instanceId.toString()], "Lineage path after removal");
        deepEqual(parentLineage.children.getKeyCount(), 0, "Parent's children count after removal");
        equal(typeof childLineage.parent, 'undefined', "Parent reference after removal");
    });

    test("Collecting descendants", function () {
        var ancestor = sntls.Progenitor.create()
                .addToLineage('foo'),
            child1 = sntls.Progenitor.create()
                .addToLineage('foo', ancestor),
            child2 = sntls.Progenitor.create()
                .addToLineage('foo', ancestor),
            child3 = sntls.Progenitor.create()
                .addToLineage('foo', ancestor),
            grandchild1 = sntls.Progenitor.create()
                .addToLineage('foo', child1),
            grandchild2 = sntls.Progenitor.create()
                .addToLineage('foo', child1);

        var expected = {};
        expected[child1.instanceId] = child1;
        expected[child2.instanceId] = child2;
        expected[child3.instanceId] = child3;
        expected[grandchild1.instanceId] = grandchild1;
        expected[grandchild2.instanceId] = grandchild2;

        deepEqual(
            ancestor.getLineage('foo').getDescendants().items,
            expected,
            "Collected successors"
        );
    });
}());
