/*global dessert, troop, sntls */
troop.postpone(sntls, 'Managed', function (ns, className) {
    "use strict";

    var base = sntls.Documented,
        self = base.extend(className);

    /**
     * Managed trait, extends the Documented trait with a controllable instance registry.
     * @class
     * @extends sntls.Documented
     */
    sntls.Managed = self
        .addPublic(/** @lends sntls.Managed */{
            instanceRegistry: sntls.Collection.create()
        })
        .addMethods(/** @lends sntls.Managed# */{
            /**
             * @ignore
             */
            init: function () {
                base.init.call(this);
                this.addToRegistry();
            },

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
             * Prepares instance for garbage collection.
             * @returns {sntls.Managed}
             */
            destroy: function () {
                this.removeFromRegistry();
                return this;
            },

            /**
             * Fetches instance by ID.
             * @param {number|string} instanceId
             * @returns {sntls.Managed}
             * @memberOf sntls.Managed
             */
            getInstanceById: function (instanceId) {
                return self.instanceRegistry.getItem(instanceId);
            }
        });
});
