/**
 * Hash Object
 *
 * General wrapper around objects to treat them as hash.
 * No `Object`-delegated methods on `.init` should be called as they mey break code.
 * All methods that operate *on* `.init` should be implemented on `Hash`.
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
             * @param {boolean} [readOnly=false] Whether the hash is read-only.
             * Setter methods in derived classes should refer to this flag when
             * allowing write operations.
             */
            init: function (items, readOnly) {
                dessert.isObjectOptional(items);

                this.items = items || {};
                this.readOnly = !!readOnly || false;
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
