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

        result = Widget.addStateLayer('openable', stateMatrix);

        strictEqual(result, Widget, "Layer addition returns caller");

        deepEqual(Widget.stateMatrices.items, {
            'openable': stateMatrix
        });
    });

    test("State transition", function () {
        /**
         * @class Widget
         * @extends sntls.Stateful
         */
        var Widget = troop.Base.extend()
                .addTrait(Stateful)
                .addStateLayer('layer', stateMatrix)
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
        deepEqual(widget.currentStates.items, {}, "Current states container empty");

        result = widget.changeStateTo('open', 'layer');

        strictEqual(result, widget, "State change returns self");
        deepEqual(widget.currentStates.items, {
            layer: 'open'
        }, "Available layers");

        widget.changeStateTo('closed', 'layer');

        deepEqual(widget.currentStates.items, {
            layer: 'closed'
        }, "Available layers");

        ok(isClosed, "Open -> closed state transition done");
        ok(!isOpen, "Closed -> open state transition NOT done");

        widget.changeStateTo('open', 'layer');

        ok(isOpen, "Closed -> open state transition done");
    });
}(sntls.Stateful));
