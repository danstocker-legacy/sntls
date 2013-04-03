/**
 * Tree
 *
 * Manages tree data structure
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Tree', function () {
    /**
     * @class sntls.Tree
     * @extends troop.Base
     */
    sntls.Tree = troop.Base.extend()
        .addMethod(/** @lends sntls.Tree */{
            /**
             * @param {object} [json] Initial tree buffer
             */
            init: function (json) {
                dessert.isObjectOptional(json);

                this.addPublic(/** @lends sntls.Tree */{
                    root: json || {}
                });
            },

            /**
             * Fetches a node from the tree.
             * @param {sntls.Path|string|string[]} path Path to node
             * @return {object}
             */
            getNode: function (path) {
                if (!sntls.Path.isBaseOf(path)) {
                    path = sntls.Path.create(path);
                }
                return path.resolve(this.root);
            },

            /**
             * Sets a node in the tree.
             * @param {sntls.Path|string|string[]} path Path to node
             * @param {*} value Node value to set
             * @return {sntls.Tree}
             */
            setNode: function (path, value) {
                if (!sntls.Path.isBaseOf(path)) {
                    path = sntls.Path.create(path);
                }

                var node = path.trim().resolveOrBuild(this.root),
                    asArray = path.asArray,
                    lastKey = asArray[asArray.length - 1];

                node[lastKey] = value;

                return this;
            }
        });
});

dessert.addTypes(/** @lends dessert */{
    isTree: function (expr) {
        return sntls.Tree.isBaseOf(expr);
    },

    isTreeOptional: function (expr) {
        return typeof expr === 'undefined' ||
               sntls.Tree.isBaseOf(expr);
    }
});
