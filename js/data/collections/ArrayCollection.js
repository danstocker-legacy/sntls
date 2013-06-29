/*global dessert, troop, sntls */
troop.postpone(sntls, 'ArrayCollection', function () {
    "use strict";

    /**
     * @class sntls.ArrayCollection
     * @extends sntls.Collection
     * @extends Array
     */
    sntls.ArrayCollection = sntls.Collection.of(Array);

    /**
     * @name sntls.ArrayCollection.create
     * @returns {sntls.ArrayCollection}
     */
});

(function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash */{
        /**
         * @returns {sntls.ArrayCollection}
         */
        toArrayCollection: function () {
            return sntls.ArrayCollection.create(this.items);
        }
    });
}());
