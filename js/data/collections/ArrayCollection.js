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
         * Reinterprets hash as array collection.
         * @returns {sntls.ArrayCollection}
         */
        toArrayCollection: function () {
            return sntls.ArrayCollection.create(this.items);
        }
    });

    troop.Properties.addProperties.call(
        Array.prototype,
        /** @lends Array# */{
            /**
             * Creates a new ArrayCollection instance based on the current array.
             * @returns {sntls.ArrayCollection}
             */
            toArrayCollection: function () {
                return sntls.ArrayCollection.create(this);
            }
        },
        false, false, false
    );
}());
