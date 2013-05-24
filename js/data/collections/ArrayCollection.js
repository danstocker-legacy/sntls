/*global dessert, troop, sntls */
troop.promise(sntls, 'ArrayCollection', function () {
    "use strict";

    /**
     * @class sntls.ArrayCollection
     * @extends sntls.Collection
     * @extends Array
     */
    sntls.ArrayCollection = sntls.Collection.of(Array);

    /**
     * @name sntls.ArrayCollection.create
     * @return {sntls.ArrayCollection}
     */
});

(function () {
    "use strict";

    sntls.Hash.addMethod(/** @lends sntls.Hash */{
        /**
         * @return {sntls.ArrayCollection}
         */
        toArrayCollection: function () {
            return sntls.ArrayCollection.create(this.items);
        }
    });
}());
