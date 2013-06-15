/*global dessert, troop, sntls */
troop.postpone(sntls, 'StringCollection', function () {
    "use strict";

    /**
     * @class sntls.StringCollection
     * @extends sntls.Collection
     * @extends String
     */
    sntls.StringCollection = sntls.Collection.of(String);

    /**
     * @name sntls.StringCollection.create
     * @return {sntls.StringCollection}
     */
});

(function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash */{
        /**
         * @return {sntls.StringCollection}
         */
        toStringCollection: function () {
            return sntls.StringCollection.create(this.items);
        }
    });
}());
