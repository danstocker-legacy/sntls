/*global dessert, troop, sntls */
troop.promise(sntls, 'DateCollection', function () {
    "use strict";

    /**
     * @name sntls.DateCollection.create
     * @return {sntls.DateCollection}
     */

    /**
     * @class sntls.DateCollection
     * @extends sntls.Collection
     * @extends Date
     */
    sntls.DateCollection = sntls.Collection.of(Date);
});

(function () {
    "use strict";

    sntls.Hash.addMethod(/** @lends sntls.Hash */{
        /**
         * @return {sntls.DateCollection}
         */
        toDateCollection: function () {
            return sntls.DateCollection.create(this.items);
        }
    });
}());
