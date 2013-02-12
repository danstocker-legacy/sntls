/**
 * Collection keeping a log of changes.
 */
/*global troop, sntls */
troop.promise(sntls, 'JournalingCollection', function (sntls) {
    var base = sntls.Collection;

    sntls.JournalingCollection = base.extend()
        .addMethod({
            //////////////////////////////
            // OOP

            /**
             * @constructor
             * @param [items] {object} Initial contents.
             */
            init: function (items) {
                base.init.call(this, items);

                this.addConstant({
                    log: []
                });
            },

            //////////////////////////////
            // Overrides

            /**
             * Sets an item in the collection.
             * @param name {string} Item name.
             * @param item Item variable / object.
             */
            set: function (name, item) {
                var isAdd = !this.items.hasOwnProperty(name);

                // logging change
                this.log.unshift({
                    method: isAdd ? 'add' : 'change',
                    name  : name,
                    item  : item // before the change
                });

                base.set.apply(this, arguments);

                return this;
            },

            /**
             * Removes item from sntls.LOOKUP.
             * @param name {string} Item name.
             */
            unset: function (name) {
                if (this.items.hasOwnProperty(name)) {
                    // adding to log
                    this.log.unshift({
                        method: 'remove',
                        name  : name,
                        item  : this.items[name]
                    });
                }

                base.unset.apply(this, arguments);

                return this;
            },

            //////////////////////////////
            // Content manipulation

            /**
             * Empties collection.
             */
            clear: function () {
                this.resetLog();
                base.clear.apply(this, arguments);
                return this;
            },

            /**
             * Resets collection log.
             */
            resetLog: function () {
                var log = this.log;
                log.splice(0, log.length);
                return this;
            }
        });
});
