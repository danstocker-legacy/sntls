/*global dessert, troop, sntls */
troop.postpone(sntls, 'Progenitor', function (ns, className) {
    "use strict";

    var base = sntls.Managed,
        self = base.extend(className);

    /**
     * Trait that adds parent-children relations to classes.
     * @class
     * @extends sntls.Managed
     */
    sntls.Progenitor = self
        .addMethods(/** @lends sntls.Progenitor */{
            /**
             * @ignore
             */
            init: function () {
                base.init.call(this);

                /**
                 * Collection of lineages the current instance is a member of.
                 * @type {sntls.Collection}
                 */
                this.lineages = sntls.Collection.create();
            },

            /**
             * Adds current instance to a lineage as child of the specified parent.
             * @param {string} lineageName
             * @param {sntls.Progenitor} [parent]
             * @returns {sntls.Progenitor}
             */
            addToLineage: function (lineageName, parent) {
                var lineages = this.lineages,
                    lineage = lineages.getItem(lineageName),
                    parentLineage;

                if (!lineage) {
                    lineage = sntls.Path.create([this.instanceId]);
                    lineages.setItem(lineageName, lineage);
                }

                if (parent) {
                    parentLineage = parent.lineages.getItem(lineageName);
                    if (parentLineage) {
                        lineage.prepend(parentLineage);
                    }
                }

                return this;
            },

            /**
             * Removes instance from lineage.
             * @param {string} lineageName
             * @returns {sntls.Progenitor}
             */
            removeFromLineage: function (lineageName) {
                this.lineages.deleteItem(lineageName);
                return this;
            }
        });
});
