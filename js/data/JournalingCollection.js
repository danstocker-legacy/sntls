/**
 * Collection keeping a log of changes.
 */
/*global troop, sntls */
troop.postpone(sntls, 'JournalingCollection', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        base = sntls.Collection;

    /**
     * @class sntls.JournalingCollection
     * @extends sntls.Collection
     */
    sntls.JournalingCollection = base.extend()
        .addMethods(/** @lends sntls.JournalingCollection */{
            /**
             * @name sntls.JournalingCollection.create
             * @return {sntls.JournalingCollection}
             */

            /**
             * @constructor
             * @param {object} [items] Initial contents.
             */
            init: function (items) {
                base.init.apply(this, arguments);

                /**
                 * Change log
                 * @type {Array}
                 */
                this.log = [];
            },

            /**
             * Sets an item in the collection.
             * @param {string} name Item name.
             * @param item Item variable / object.
             * @return {sntls.JournalingCollection}
             */
            setItem: function (name, item) {
                var isInCollection = hOP.call(this.items, name);

                base.setItem.apply(this, arguments);

                // logging change
                this.log.unshift({
                    method: isInCollection ? 'change': 'add',
                    name  : name,
                    item  : item // before the change
                });

                return this;
            },

            /**
             * Removes item from sntls.LOOKUP.
             * @param {string} name Item name.
             * @return {sntls.JournalingCollection}
             */
            deleteItem: function (name) {
                var isInCollection = hOP.call(this.items, name),
                    oldItem = this.items[name];

                base.deleteItem.apply(this, arguments);

                if (isInCollection) {
                    // adding to log
                    this.log.unshift({
                        method: 'remove',
                        name  : name,
                        item  : oldItem
                    });
                }

                return this;
            },

            /**
             * Empties collection.
             * @return {sntls.JournalingCollection}
             */
            clear: function () {
                base.clear.apply(this, arguments);
                this.resetLog();
                return this;
            },

            /**
             * Resets collection log.
             * @return {sntls.JournalingCollection}
             */
            resetLog: function () {
                var log = this.log;
                log.splice(0, log.length);
                return this;
            }
        });
});

(function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash */{
        /**
         * @return {sntls.JournalingCollection}
         */
        toJournalingCollection: function () {
            return sntls.JournalingCollection.create(this.items);
        }
    });
}());
