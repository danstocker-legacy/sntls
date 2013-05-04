/*global dessert, troop, sntls */
troop.promise(sntls, 'StringCollection', function () {
    "use strict";

    /**
     * @name sntls.StringCollection.create
     * @return {sntls.StringCollection}
     */

    /**
     * @class sntls.StringCollection
     * @extends sntls.Collection
     * @extends String
     */
    sntls.StringCollection = sntls.Collection.of(String);
});

(function () {
    "use strict";

    sntls.Hash.addMethod(/** @lends sntls.Hash */{
        /**
         * @return {sntls.StringCollection}
         */
        toStringCollection: function () {
            return sntls.StringCollection.create(this.items);
        }
    });
}());
