/*global dessert, troop, sntls */
troop.postpone(sntls, 'Progenitor', function (ns, className) {
    "use strict";

    var base = sntls.Managed,
        self = base.extend(className);

    /**
     * @name sntls.Progenitor.create
     * @function
     * @returns {sntls.Progenitor}
     */

    /**
     * Trait that adds parent-children relations to classes.
     * @class
     * @extends sntls.Managed
     */
    sntls.Progenitor = self
        .addMethods(/** @lends sntls.Progenitor# */{
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
             * Retrieves a lineage by the specified name.
             * @param {string} [lineageName]
             * @returns {sntls.Lineage}
             */
            getLineage: function (lineageName) {
                return lineageName ?
                    this.lineages.getItem(lineageName) :
                    this.lineages.getFirstValue();
            },

            /**
             * Registers a lineage on the current instance.
             * @param {string} lineageName
             * @returns {sntls.Progenitor}
             */
            registerLineage: function (lineageName) {
                this.lineages.setItem(lineageName, sntls.Lineage.create(lineageName, this));
                return this;
            },

            /**
             * Adds current instance to a lineage as child of the specified parent.
             * @param {string} lineageName
             * @param {sntls.Progenitor} [parent]
             * @returns {sntls.Progenitor}
             */
            addToLineage: function (lineageName, parent) {
                // making sure lineage exists
                if (!this.getLineage(lineageName)) {
                    this.registerLineage(lineageName);
                }

                if (parent) {
                    // adding instance to parent
                    this.getLineage(lineageName)
                        .addToParent(parent);
                }

                return this;
            },

            /**
             * Adds a child to the specified lineage.
             * @param {string} lineageName
             * @param {sntls.Progenitor} child
             * @returns {sntls.Progenitor}
             */
            addChild: function (lineageName, child) {
                if (!this.getLineage(lineageName)) {
                    this.registerLineage(lineageName);
                }

                child.addToLineage(lineageName, this);

                return this;
            },

            /**
             * Removes child from the specified lineage.
             * @param {string} lineageName
             * @param {sntls.Progenitor} child
             * @returns {sntls.Progenitor}
             */
            removeChild: function (lineageName, child) {
                var lineage = this.getLineage(lineageName),
                    childLineage;

                if (lineage && lineage.children.getItem(child.instanceId)) {
                    // child instance is in fact child on the specified lineage
                    childLineage = child.getLineage(lineageName);
                    if (childLineage) {
                        // removing child from parent
                        childLineage.removeFromParent();
                    }
                }

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
                    result;

                if (lineage) {
                    result = lineage.parent;
                }

                return result;
            }
        });
});
