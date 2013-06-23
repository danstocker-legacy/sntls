/*global sntls, troop, module, test, ok, equal, strictEqual, deepEqual, notDeepEqual, raises, expect */
(function () {
    "use strict";

    module("StateMatrix");

    test("Instantiation", function () {
        var stateMatrix = sntls.StateMatrix.create();

        ok(stateMatrix.edges.isA(sntls.Tree), "Edge buffer is a tree");
        deepEqual(stateMatrix.edges.items, {}, "Edge buffer initially empty");
    });

    test("Edge addition", function () {
        var stateMatrix = sntls.StateMatrix.create();

        raises(function () {
            stateMatrix.addEdge();
        }, "Invalid arguments");

        stateMatrix.addEdge('open', 'closed', 'close');
        deepEqual(stateMatrix.edges.items, {
            'open': {
                'closed': 'close'
            }
        }, "Edge buffer after first addition");

        stateMatrix.addEdge('closed', 'open', 'open');
        deepEqual(stateMatrix.edges.items, {
            'open'  : {
                'closed': 'close'
            },
            'closed': {
                'open': 'open'
            }
        }, "Edge buffer after subsequent addition");
    });

    test("Load retrieval", function () {
        var stateMatrix = sntls.StateMatrix.create()
            .addEdge('open', 'closed', 'close');

        equal(stateMatrix.getLoad('open', 'closed'), 'close', "Valid load retrieved");
        equal(typeof stateMatrix.getLoad('closed', 'open'), 'undefined', "Invalid load retrieved");
    });
}());
