/**
 * Ordered Array
 *
 * Inserts, deletes, searches in an ordered array
 * of strings or numbers.
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'OrderedArray', function () {
    /**
     * @class sntls.OrderedArray
     * @extends troop.Base
     */
    sntls.OrderedArray = troop.Base.extend()
        .addPrivateMethod({
            /**
             * Compares numbers. To be supplied to Array.sort().
             * @private
             * @static
             */
            _compareNumbers: function (a, b) {
                return a > b ? 1 : a < b ? -1 : 0;
            }
        })
        .addMethod(/** @lends sntls.OrderedArray */{
            /**
             * @param {string[]|number[]} [items] Initial values
             */
            init: function (items) {
                dessert.isArrayOptional(items, "Invalid initial items");

                // preparing items buffer
                items = items || [];
                if (items.length) {
                    // sorting items
                    items.sort(typeof items[0] === 'number' ?
                        this._compareNumbers :
                        undefined
                    );
                }

                this.addPublic(/** @lends sntls.OrderedArray */{
                    /**
                     * @type {string[]|number[]}
                     */
                    items: items
                });
            },

            /**
             * Performs binary search on items and returns the (suggested) index for the value.
             * @param {number} value Lookup value.
             * @param {number} [start=0] Start position of search range. Default: 0.
             * @param {number} [end] Ending position of search range. Default: this.length - 1.
             * @return {number|undefined}
             */
            indexOf: function (value, start, end) {
                var items = this.items,
                    pos,
                    hit; //

                start = start || 0;
                end = end || this.items.length - 1;

                pos = Math.floor((start + end) / 2);
                hit = items[pos];

                if (hit === value) {
                    // perfect hit
                    return pos;
                } else if (items[end] <= value) {
                    // end of range hit
                    return end;
                } else if (end - start <= 1) {
                    // between two adjacent values
                    return start;
                } else if (hit > value) {
                    // narrowing range to lower half
                    return this.indexOf(value, start, pos);
                } else if (hit < value) {
                    // narrowing range to upper half
                    return this.indexOf(value, pos, end);
                }
            },

            addItem: function (value) {
                return this;
            },

            removeItem: function (value) {
                return this;
            }
        });
});
