/*global sntls, troop, module, test, ok, equal, strictEqual, deepEqual, notDeepEqual, raises, expect */
(function (Stateful) {
    module("Stateful");

    var stateMatrix = sntls.StateMatrix.create()
        .addEdge('open', 'closed', 'close')
        .addEdge('closed', 'open', 'open');

    test("Layer addition", function () {
        /**
         * @class Widget
         * @extends sntls.Stateful
         */
        var Widget = troop.Base.extend()
                .addTrait(Stateful),
            result;

        raises(function () {
            Widget.addStateLayer();
        }, "Invalid arguments");

        raises(function () {
            Widget.addStateLayer('layer', 'foo');
        }, "Invalid state matrix argument");

        raises(function () {
            Widget.addStateLayer('layer', stateMatrix, 1);
        }, "Invalid default state argument");

        result = Widget.addStateLayer('openable', stateMatrix, 'closed');

        strictEqual(result, Widget, "Layer addition returns caller");

        deepEqual(Widget.stateMatrices.items, {
            'openable': stateMatrix
        });

        deepEqual(Widget.defaultStates.items, {
            'openable': 'closed'
        });
    });

    test("State transition", function () {
        /**
         * @class Widget
         * @extends troop.Base
         * @extends sntls.Stateful
         */
        var Widget = troop.Base.extend()
                .addTrait(Stateful)
                .addStateLayer('layer', stateMatrix, 'closed')
                .addMethod({
                    init: function () {
                        this.initStateful();
                    },

                    open: function () {
                        isOpen = true;
                    },

                    close: function () {
                        isClosed = true;
                    }
                }),
            widget = Widget.create(),
            isOpen, isClosed,
            result;

        ok(widget.currentStates.isA(sntls.Collection), "Current state container collection");
        deepEqual(widget.currentStates.items, {layer: 'closed'}, "Current states container empty");

        result = widget.changeStateTo('open', 'layer');

        strictEqual(result, widget, "State change returns self");
        deepEqual(widget.currentStates.items, {
            layer: 'open'
        }, "Available layers");
        ok(isOpen, "Closed -> open state transition done");

        widget.changeStateTo('closed', 'layer');

        deepEqual(widget.currentStates.items, {
            layer: 'closed'
        }, "Available layers");
        ok(isClosed, "Open -> closed state transition done");
    });

    test("State retrieval", function () {
        /**
         * @class Widget
         * @extends troop.Base
         * @extends sntls.Stateful
         */
        var Widget = troop.Base.extend()
                .addTrait(Stateful)
                .addStateLayer('layer', stateMatrix, 'closed')
                .addMethod({
                    init: function () {
                        this.initStateful();
                    },

                    open: function () {},

                    close: function () {}
                }),
            widget = /** @type {Widget} */ Widget.create();

        equal(widget.currentState('layer'), 'closed', "Initial state");

        widget.changeStateTo('open', 'layer');

        equal(widget.currentState('layer'), 'open', "New state");
    });
}(sntls.Stateful));
