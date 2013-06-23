/*global dessert, troop, sntls */
troop.postpone(sntls, 'IterativeTreeWalker', function () {
    "use strict";

    /**
     * @class sntls.IterativeTreeWalker
     * @extends troop.Base
     */
    sntls.IterativeTreeWalker = troop.Base.extend()
        .addMethods(/** @lends sntls.IterativeTreeWalker */{
            /**
             * Traverses all enumerable nodes in object.
             * Iterative implementation.
             * @param obj {object} Object to be traversed.
             * @param handler {function} Called on each node.
             * @static
             */
            walk: function (obj, handler) {
                var keysStack = [Object.keys(obj)], // stack of keys associated with each node on current path
                    indexStack = [0], // stack of key indexes on current path
                    nodeStack = [obj], // stack of nodes on current path

                    path = [], // key stack, ie. traversal path, calculated

                    currentDepth, // current traversal depth
                    currentParent, // the node we're currently IN (current parent node)
                    currentKeys, // keys in the current parent node
                    currentIndex, // index of key in current parent node
                    currentKey, // key of node we're AT
                    currentNode; // node we're currently AT

                for (; ;) {
                    // determining where we are
                    currentDepth = keysStack.length - 1;
                    currentIndex = indexStack[currentDepth];

                    // testing if current node finished traversal
                    if (currentIndex >= keysStack[currentDepth].length) {
                        // going back a level
                        keysStack.pop();

                        if (!keysStack.length) {
                            // object is fully traversed, exiting
                            break;
                        }

                        nodeStack.pop();
                        indexStack.pop();
                        path.pop();

                        // raising index on parent node
                        indexStack.push(indexStack.pop() + 1);

                        continue;
                    }

                    // obtaining current state as local variables
                    currentKeys = keysStack[currentDepth];
                    currentKey = currentKeys[currentIndex];
                    currentParent = nodeStack[currentDepth];
                    currentNode = currentParent[currentKey];
                    path[currentDepth] = currentKey;

                    // calling handler for this node
                    // traversal may be terminated by handler by returning false
                    if (handler.call(currentNode, path, currentKey, currentDepth) === false) {
                        break;
                    }

                    // next step in traversal
                    if (currentNode instanceof Object) {
                        // burrowing deeper - found a node
                        nodeStack.push(currentNode);
                        indexStack.push(0);
                        keysStack.push(Object.keys(currentNode));
                    } else {
                        // moving to next node in parent
                        indexStack[currentDepth]++;
                    }
                }
            }
        });
});
