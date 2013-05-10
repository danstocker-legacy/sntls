/**
 * Hash Object
 *
 * General wrapper around objects to treat them as hash.
 * No `Object`-delegated methods on `.items` should be called as they may break code.
 * All methods that operate *on* `.items` should be implemented on `Hash`.
 *
 * Other `Hash`-based classes may delegate conversion methods to this class.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'Hash', function () {
    "use strict";

    /**
     * @class sntls.Hash
     * @extends troop.Base
     */
    sntls.Hash = troop.Base.extend()
        .addMethod(/** @lends sntls.Hash */{
            /**
             * @name sntls.Hash.create
             * @return {sntls.Hash}
             */

            /**
             * @param {object} items Container for hash items.
             * Setter methods in derived classes should refer to this flag when
             * allowing write operations.
             */
            init: function (items) {
                dessert.isObjectOptional(items, "Invalid items");

                this.items = items || {};
            }
        });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        isHash: function (expr) {
            return sntls.Hash.isBaseOf(expr);
        },

        isHashOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Hash.isBaseOf(expr);
        }
    });
}());
