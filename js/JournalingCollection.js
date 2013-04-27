/**
 * Collection keeping a log of changes.
 */
/*global troop, sntls */
troop.promise(sntls, 'JournalingCollection', function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        base = sntls.Collection;

    /**
     * @class sntls.JournalingCollection
     * @extends sntls.Collection
     */
    sntls.JournalingCollection = base.extend()
        .addMethod(/** @lends sntls.JournalingCollection */{
            //////////////////////////////
            // OOP

            /**
             * @name sntls.JournalingCollection.create
             * @return {sntls.JournalingCollection}
             */

            /**
             * @constructor
             * @param {object} [items] Initial contents.
             */
            init: function (items) {
                base.init.call(this, items);

                this.addConstant(/** @lends sntls.JournalingCollection */{
                    log: []
                });
            },

            //////////////////////////////
            // Overrides

            /**
             * Sets an item in the collection.
             * @param {string} name Item name.
             * @param item Item variable / object.
             * @return {sntls.JournalingCollection}
             */
            setItem: function (name, item) {
                var isAdd = !hOP.call(this.items, name);

                // logging change
                this.log.unshift({
                    method: isAdd ? 'add' : 'change',
                    name  : name,
                    item  : item // before the change
                });

                base.setItem.apply(this, arguments);

                return this;
            },

            /**
             * Removes item from sntls.LOOKUP.
             * @param {string} name Item name.
             * @return {sntls.JournalingCollection}
             */
            deleteItem: function (name) {
                if (hOP.call(this.items, name)) {
                    // adding to log
                    this.log.unshift({
                        method: 'remove',
                        name  : name,
                        item  : this.items[name]
                    });
                }

                base.deleteItem.apply(this, arguments);

                return this;
            },

            //////////////////////////////
            // Content manipulation

            /**
             * Empties collection.
             * @return {sntls.JournalingCollection}
             */
            clear: function () {
                this.resetLog();
                base.clear.apply(this, arguments);
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
