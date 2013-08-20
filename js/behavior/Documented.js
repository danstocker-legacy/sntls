/*global dessert, troop, sntls */
troop.postpone(sntls, 'Documented', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * Documented trait. Adds meta information to the class, including class name, namespace, and instance ID.
     * @class
     * @extends troop.Base
     */
    sntls.Documented = self
        .addPublic(/** @lends sntls.Documented */{
            /**
             * Next instance ID.
             * @type {number}
             */
            nextInstanceId: 0
        })
        .addMethods(/** @lends sntls.Documented */{
            /**
             * Extends class adding meta information.
             * @param {string} className Class name
             * @returns {sntls.Documented}
             */
            extend: function (className) {
                dessert.isString(className, "Invalid class name");

                var result = /** @type {sntls.Documented} */ base.extend.call(this);

                result.addConstants(/** @lends sntls.Documented */{
                    /**
                     * @type {string}
                     */
                    className: className
                });

                return result;
            },

            /**
             * @ignore
             */
            init: function () {
                /**
                 * Instance ID.
                 * @type {number}
                 * @memberOf sntls.Documented#
                 */
                this.instanceId = self.nextInstanceId++;
            }
        });
});
