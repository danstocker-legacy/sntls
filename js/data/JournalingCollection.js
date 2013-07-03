/*global troop, sntls */
troop.postpone(sntls, 'JournalingCollection', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        base = sntls.Collection;

    /**
     * @name sntls.JournalingCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {sntls.JournalingCollection}
     */

    /**
     * Collection that keeps a log of changes.
     * @class sntls.JournalingCollection
     * @extends sntls.Collection
     */
    sntls.JournalingCollection = base.extend()
        .addMethods(/** @lends sntls.JournalingCollection# */{
            /**
             * @param {object} [items] Initial contents.
             * @ignore
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
             * @param {string} itemKey Item key.
             * @param item Item variable / object.
             * @returns {sntls.JournalingCollection}
             */
            setItem: function (itemKey, item) {
                var isInCollection = hOP.call(this.items, itemKey);

                base.setItem.apply(this, arguments);

                // logging change
                this.log.unshift({
                    method: isInCollection ? 'change': 'add',
                    name  : itemKey,
                    item  : item // before the change
                });

                return this;
            },

            /**
             * Removes item from sntls.LOOKUP.
             * @param {string} itemKey Item key.
             * @returns {sntls.JournalingCollection}
             */
            deleteItem: function (itemKey) {
                var isInCollection = hOP.call(this.items, itemKey),
                    oldItem = this.items[itemKey];

                base.deleteItem.apply(this, arguments);

                if (isInCollection) {
                    // adding to log
                    this.log.unshift({
                        method: 'remove',
                        name  : itemKey,
                        item  : oldItem
                    });
                }

                return this;
            },

            /**
             * Empties collection.
             * @returns {sntls.JournalingCollection}
             */
            clear: function () {
                base.clear.apply(this, arguments);
                this.resetLog();
                return this;
            },

            /**
             * Resets collection log.
             * @returns {sntls.JournalingCollection}
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

    sntls.Hash.addMethods(/** @lends sntls.Hash# */{
        /**
         * @returns {sntls.JournalingCollection}
         */
        toJournalingCollection: function () {
            return sntls.JournalingCollection.create(this.items);
        }
    });
}());
