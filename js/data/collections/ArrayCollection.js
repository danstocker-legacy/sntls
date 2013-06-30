/*global dessert, troop, sntls */
troop.postpone(sntls, 'ArrayCollection', function () {
    "use strict";

    /**
     * @name sntls.ArrayCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {sntls.ArrayCollection}
     */

    /**
     * General collection for managing multiple arrays.
     * @class sntls.ArrayCollection
     * @extends sntls.Collection
     * @extends Array
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
     */
    sntls.ArrayCollection = sntls.Collection.of(Array);
});

(function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash# */{
        /**
         * @returns {sntls.ArrayCollection}
         */
        toArrayCollection: function () {
            return sntls.ArrayCollection.create(this.items);
        }
    });
}());
