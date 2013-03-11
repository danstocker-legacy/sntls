/* global sntls, troop, module, test, ok, equal, strictEqual, deepEqual, notDeepEqual, raises, expect */
(function (StateMatrix) {
    module("StateMatrix");

    test("Instantiation", function () {
        var stateMatrix = StateMatrix.create();

        deepEqual(stateMatrix.edges, {}, "Edges buffer initially empty");
    });

    test("Edge addition", function () {
        var stateMatrix = StateMatrix.create();

        raises(function () {
            stateMatrix.addEdge();
        }, "Invalid arguments");

        stateMatrix.addEdge('open', 'closed', 'close');
        deepEqual(stateMatrix.edges, {
            'open': {
                'closed': 'close'
            }
        }, "Edge buffer after first addition");

        stateMatrix.addEdge('closed', 'open', 'open');
        deepEqual(stateMatrix.edges, {
            'open'  : {
                'closed': 'close'
            },
            'closed': {
                'open': 'open'
            }
        }, "Edge buffer after subsequent addition");
    });

    test("Load retrieval", function () {
        var stateMatrix = StateMatrix.create()
            .addEdge('open', 'closed', 'close');

        equal(stateMatrix.getLoad('open', 'closed'), 'close', "Valid load retrieved");
        equal(typeof stateMatrix.getLoad('closed', 'open'), 'undefined', "Invalid load retrieved");
    });
}(sntls.StateMatrix));
