/*global dessert, troop, sntls */
troop.postpone(sntls, 'Lineage', function () {
    "use strict";

    /**
     * @name sntls.Lineage.create
     * @function
     * @param {string} lineageName
     * @param {sntls.Documented} successor
     * @returns {sntls.Lineage}
     */

    /**
     * Lineage specific to an instance. Describes the relation of an instance to its ancestors and children.
     * @class
     * @extends troop.Base
     */
    sntls.Lineage = troop.Base.extend()
        .addMethods(/** @lends sntls.Lineage# */{
            /**
             * @param {string} lineageName
             * @param {sntls.Documented} instance
             * @ignore
             */
            init: function (lineageName, instance) {
                dessert
                    .isString(lineageName, "Invalid lineage name")
                    .isClass(instance, "Invalid instance");

                /**
                 * Name of the lineage. Analogous to a family name.
                 * @type {string}
                 */
                this.lineageName = lineageName;

                /**
                 * Instance the lineage is referring to.
                 * @type {sntls.Documented}
                 */
                this.instance = instance;

                /**
                 * Path describing instance lineage. When there's a valid parent specified, the path extends
                 * the parent's path with the current successor's instance ID.
                 * @type {sntls.Path}
                 */
                this.path = sntls.Path.create([instance.instanceId]);

                /**
                 * Reference to the parent. Set only when the specified parent is part of the same lineage.
                 * @type sntls.Progenitor
                 */
                this.parent = undefined;

                /**
                 * Collection of child instances.
                 * @type {sntls.Collection}
                 */
                this.children = sntls.Collection.create();
            },

            /**
             * Retrieves all successors (children, children's children, etc.) in a collection.
             * Exploits the fact that children are indexed by `instanceId`!
             * @return {sntls.Collection}
             */
            getDescendants: function () {
                return this.children.toTree()
                    .queryKeyValuePairsAsHash('\\>lineages>items>|>children>items>|'.toQuery())
                    .toCollection()
                    .mergeWith(this.children);
            },

            /**
             * Sets parent on the current lineage.
             * @param {sntls.Progenitor} parent
             * @returns {sntls.Lineage}
             */
            addToParent: function (parent) {
                dessert.isClass(parent, "Invalid parent");

                var parentLineage = parent.getLineage(this.lineageName);

                if (parentLineage) {
                    // modifying lineage path of all successors
                    this.getDescendants()
                        .callOnEachItem('getLineage', this.lineageName)
                        .collectProperty('path') // lineage paths of all successors
                        .setItem('current', this.path) // including own path
                        .callOnEachItem('prepend', parentLineage.path);

                    // adding current instance to parent's children collection
                    parentLineage.children.setItem(this.instance.instanceId, this.instance);

                    // setting parent reference
                    this.parent = parent;
                }

                return this;
            },

            /**
             * Removes current lineage from parent and trims lineage path of all descendants.
             * @returns {sntls.Lineage}
             */
            removeFromParent: function () {
                var parent = this.parent,
                    parentLineage,
                    parentLineageLength;

                if (parent) {
                    parentLineage = parent.getLineage(this.lineageName);
                    parentLineageLength = parentLineage.path.asArray.length;

                    // modifying lineage path of all successors
                    this.getDescendants()
                        .callOnEachItem('getLineage', this.lineageName)
                        .collectProperty('path') // lineage paths of all successors
                        .setItem('current', this.path) // including own path
                        .callOnEachItem('trimLeft', parentLineageLength);

                    // removing instance from parent's children collection
                    parentLineage.children.deleteItem(this.instance.instanceId);

                    // resetting parent reference
                    this.parent = undefined;
                }

                return this;
            }
        });
});
