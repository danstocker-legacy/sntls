/*global dessert, troop, sntls */
troop.postpone(sntls, 'Managed', function () {
    "use strict";

    var self = troop.Base.extend();

    /**
     * Managed trait, extends the Documented trait with a controllable instance registry.
     * @class
     * @extends sntls.Documented
     */
    sntls.Managed = self
        .addTrait(sntls.Documented)
        .addPublic(/** @lends sntls.Managed */{
            instanceRegistry: sntls.Collection.create()
        })
        .addMethods(/** @lends sntls.Managed# */{
            /**
             * Adds instance to registry.
             * @returns {sntls.Managed}
             */
            addToRegistry: function () {
                self.instanceRegistry.setItem(this.instanceId, this);
                return this;
            },

            /**
             * Removes instance from registry.
             * @returns {sntls.Managed}
             */
            removeFromRegistry: function () {
                self.instanceRegistry.deleteItem(this.instanceId);
                return this;
            },

            /**
             * Fetches instance by ID.
             * @param instanceId
             * @returns {sntls.Managed}
             * @memberOf sntls.Managed
             */
            getInstanceById: function (instanceId) {
                return self.instanceRegistry.getItem(instanceId);
            }
        });
});
