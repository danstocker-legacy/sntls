/*global dessert, troop, sntls */
troop.postpone(sntls, 'Set', function () {
    "use strict";

    var base = sntls.Hash,
        self = base.extend(),
        hOP = Object.prototype.hasOwnProperty;

    /**
     * Instantiates class.
     * @name sntls.Set.create
     * @function
     * @param {object} items
     * @returns {sntls.Set}
     */

    /**
     * Hash-based structure for performing standard set operations such as union, intersection, and difference.
     * @class
     * @extends sntls.Hash
     */
    sntls.Set = self
        .addMethods(/** @lends sntls.Set# */{
            /**
             * Retrieves intersection of two sets.
             * @param {sntls.Set} remoteSet
             * @return {sntls.Set} New set instance with items present in both current and remote set.
             */
            intersectWith: function (remoteSet) {
                dessert.isSet(remoteSet, "Invalid set");

                var currentItems = this.items,
                    remoteItems = remoteSet.items,
                    resultItems = currentItems instanceof Array ? [] : {},
                    itemKey;

                for (itemKey in currentItems) {
                    if (hOP.call(currentItems, itemKey) &&
                        hOP.call(remoteItems, itemKey)) {
                        resultItems[itemKey] = currentItems[itemKey];
                    }
                }

                return this.getBase().create(resultItems);
            },

            /**
             * Extracts symmetric difference of two sets.
             * @param {sntls.Set} remoteSet
             * @returns {sntls.Set} New set instance with elements only present in either current or remote set.
             */
            differenceWith: function (remoteSet) {
                return this
                    .unionWith(remoteSet)
                    .subtract(this.intersectWith(remoteSet));
            },

            /**
             * Unites two sets.
             * @param {sntls.Set} remoteSet
             * @returns {sntls.Set} New set instance with items from both current and remote sets.
             */
            unionWith: function (remoteSet) {
                dessert.isSet(remoteSet, "Invalid set");

                var resultItems = sntls.Utils.shallowCopy(this.items),
                    currentItems = this.items,
                    remoteItems = remoteSet.items,
                    itemKey;

                for (itemKey in remoteItems) {
                    if (hOP.call(remoteItems, itemKey) && !hOP.call(currentItems, itemKey)) {
                        resultItems[itemKey] = remoteItems[itemKey];
                    }
                }

                return this.getBase().create(resultItems);
            },

            /**
             * Retrieves relative complement of two sets (A\B).
             * @param {sntls.Set} remoteSet
             * @returns {sntls.Set} New set instance with items from current instance except what's also present in
             * remote set.
             */
            subtract: function (remoteSet) {
                dessert.isSet(remoteSet, "Invalid set");

                var currentItems = this.items,
                    remoteItems = remoteSet.items,
                    resultItems = currentItems instanceof Array ? [] : {},
                    itemKey;

                for (itemKey in currentItems) {
                    if (hOP.call(currentItems, itemKey) &&
                        !hOP.call(remoteItems, itemKey)) {
                        resultItems[itemKey] = currentItems[itemKey];
                    }
                }

                return this.getBase().create(resultItems);
            },

            /**
             * Retrieves relative complement of two sets (B\A).
             * @param {sntls.Set} remoteSet
             * @returns {sntls.Set} New set instance with items from remote instance except what's also present in
             * current set.
             */
            subtractFrom: function (remoteSet) {
                dessert.isSet(remoteSet, "Invalid set");

                var currentItems = this.items,
                    remoteItems = remoteSet.items,
                    resultItems = currentItems instanceof Array ? [] : {},
                    itemKey;

                for (itemKey in remoteItems) {
                    if (hOP.call(remoteItems, itemKey) &&
                        !hOP.call(currentItems, itemKey)) {
                        resultItems[itemKey] = remoteItems[itemKey];
                    }
                }

                return this.getBase().create(resultItems);
            }
        });
});

troop.amendPostponed(sntls, 'Hash', function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash# */{
        /**
         * Reinterprets hash as a string dictionary.
         * @returns {sntls.Set}
         */
        toSet: function () {
            return sntls.Set.create(this.items);
        }
    });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isSet: function (expr) {
            return sntls.Set.isBaseOf(expr);
        },

        isSetOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Set.isBaseOf(expr);
        }
    });

    troop.Properties.addProperties.call(
        Array.prototype,
        /** @lends Array# */{
            /**
             * Creates a new Set instance based on the current array.
             * @returns {sntls.Set}
             */
            toSet: function () {
                return sntls.Set.create(this);
            }
        },
        false, false, false);
}());
