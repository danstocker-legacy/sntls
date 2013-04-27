/**
 * Tree
 *
 * Manages tree data structure
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Tree', function () {
    "use strict";

    /**
     * @class sntls.Tree
     * @extends sntls.Hash
     */
    sntls.Tree = sntls.Hash.extend()
        .addMethod(/** @lends sntls.Tree */{
            /**
             * @name sntls.Tree.create
             * @return {sntls.Tree}
             */

            /**
             * Retrieves the value at the specified path.
             * @param {sntls.Path} path Path to node
             * @return {*} Whatever value is found at path
             */
            getNode: function (path) {
                return path.resolve(this.items);
            },

            /**
             * Sets the node at the specified path to the given value.
             * @param {sntls.Path} path Path to node
             * @param {*} value Node value to set
             * @return {sntls.Tree}
             */
            setNode: function (path, value) {
                var node = path.trim().resolveOrBuild(this.items),
                    asArray = path.asArray,
                    lastKey = asArray[asArray.length - 1];

                node[lastKey] = value;

                return this;
            },

            /**
             * Retrieves the value at the specified path, or
             * when the path does not exist, creates path and
             * assigns the return value of the generator.
             * @param {sntls.Path} path Path to node
             * @param {function} generator Generator function returning value
             * @return {*}
             */
            getSafeNode: function (path, generator) {
                var node = path.trim().resolveOrBuild(this.items),
                    asArray = path.asArray,
                    lastKey = asArray[asArray.length - 1];

                if (!node.hasOwnProperty(lastKey)) {
                    node[lastKey] = generator();
                }

                return node[lastKey];
            },

            /**
             * Removes node at the specified path.
             * @param {sntls.Path} path Path to node
             * @return {sntls.Tree}
             */
            unsetNode: function (path) {
                var node = path.trim().resolveOrBuild(this.items),
                    asArray = path.asArray,
                    lastKey = asArray[asArray.length - 1];

                delete node[lastKey];

                return this;
            }
        });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isTree: function (expr) {
            return sntls.Tree.isBaseOf(expr);
        },

        isTreeOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Tree.isBaseOf(expr);
        }
    });

    sntls.Hash.addMethod(/** @lends sntls.Hash */{
        /**
         * @return {sntls.Tree}
         */
        toTree: function () {
            return sntls.Tree.create(this.items);
        }
    });
}());
