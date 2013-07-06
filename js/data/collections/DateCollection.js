/*global dessert, troop, sntls */
troop.postpone(sntls, 'DateCollection', function () {
    "use strict";

    /**
     * @name sntls.DateCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {sntls.DateCollection}
     */

    /**
     * General collection for managing multiple date objects.
     * @class sntls.DateCollection
     * @extends sntls.Collection
     * @extends Date
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
     */
    sntls.DateCollection = sntls.Collection.of(Date);
});

(function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash# */{
        /**
         * Reinterprets hash as date collection.
         * @returns {sntls.DateCollection}
         */
        toDateCollection: function () {
            return sntls.DateCollection.create(this.items);
        }
    });
}());
