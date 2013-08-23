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

                /**
                 * Child instances.
                 * @type {sntls.Collection}
                 */
                this.children = sntls.Collection.create();
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
                    // extending parent's lineage
                    parentLineage = parent.lineages.getItem(lineageName);
                    if (parentLineage) {
                        lineage.prepend(parentLineage);
                    }

                    // adding self to parent's children
                    parent.children.setItem(this.instanceId, this);
                }

                return this;
            },

            /**
             * Removes instance from lineage.
             * @param {string} lineageName
             * @returns {sntls.Progenitor}
             */
            removeFromLineage: function (lineageName) {
                // parent-related operations must come before abandoning lineage altogether
                var parent = this.getParent(lineageName);
                if (parent) {
                    // removing current instance from among parent's children
                    // FIXME: bug prone if child is present on multiple lineages w/ same parent
                    parent.children.deleteItem(this.instanceId);
                }

                // deleting current instance from lineage
                this.lineages.deleteItem(lineageName);

                return this;
            },

            /**
             * Retrieves parent for the specified lineage.
             * @param {string} [lineageName] Lineage name. When omitted, resolves to first available lineage.
             * @returns {sntls.Managed}
             */
            getParent: function (lineageName) {
                var lineage = lineageName ?
                        this.lineages.getItem(lineageName) :
                        this.lineages.getFirstValue(),
                    parentInstanceId,
                    result;

                if (lineage) {
                    parentInstanceId = lineage.asArray[lineage.asArray.length - 2];
                    if (parentInstanceId) {
                        result = self.getInstanceById(parentInstanceId);
                    }
                }

                return result;
            }
        });
});
