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
             * Retrieves the value at the specified path.
             * @param {sntls.Path|string|string[]} path Path to node
             * @return {*} Whatever value is found at path
             */
            getNode: function (path) {
                if (!sntls.Path.isBaseOf(path)) {
                    path = sntls.Path.create(path);
                }
                return path.resolve(this.root);
            },

            /**
             * Sets the node at the specified path to the given value.
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
            },

            /**
             * Retrieves the value at the specified path, or
             * when the path does not exist, creates path and
             * assigns the return value of the generator.
             * @param {sntls.Path|string|string[]} path Path to node
             * @param {function} generator Generator function returning value
             * @return {*}
             */
            getSafeNode: function (path, generator) {
                if (!sntls.Path.isBaseOf(path)) {
                    path = sntls.Path.create(path);
                }

                var node = path.trim().resolveOrBuild(this.root),
                    asArray = path.asArray,
                    lastKey = asArray[asArray.length - 1];

                if (!node.hasOwnProperty(lastKey)) {
                    node[lastKey] = generator();
                }

                return node[lastKey];
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
