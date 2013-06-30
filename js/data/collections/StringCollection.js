/*global dessert, troop, sntls */
troop.postpone(sntls, 'StringCollection', function () {
    "use strict";

    /**
     * @name sntls.StringCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {sntls.StringCollection}
     */

    /**
     * General collection for managing multiple strings.
     * @class sntls.StringCollection
     * @extends sntls.Collection
     * @extends String
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
     */
    sntls.StringCollection = sntls.Collection.of(String);
});

(function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash# */{
        /**
         * @returns {sntls.StringCollection}
         */
        toStringCollection: function () {
            return sntls.StringCollection.create(this.items);
        }
    });
}());
