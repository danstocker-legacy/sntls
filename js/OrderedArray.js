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
             * Performs binary search on items and returns the index where a given value
             * would be spliced into the array. For exact hits, this is the actual position,
             * but no information is given whether the value is present in the array.
             * @param {string|number} value Array item value.
             * @param {number} [start=0] Start position of search range. Default: 0.
             * @param {number} [end] Ending position of search range. Default: this.length - 1.
             * @return {number|undefined}
             */
            spliceIndexOf: function (value, start, end) {
                var items = this.items,
                    medianPos, // position of the median within range
                    medianValue; // median value within range

                start = start || 0;
                end = end || (items.length || 1) - 1;

                medianPos = Math.floor((start + end) / 2);
                medianValue = items[medianPos];

                if (medianValue === value) {
                    // perfect hit
                    return medianPos;
                } else if (items[start] >= value) {
                    // out of range hit
                    return start;
                } else if (end - start <= 1) {
                    // between two adjacent values
                    return end;
                } else if (medianValue > value) {
                    // narrowing range to lower half
                    return this.spliceIndexOf(value, start, medianPos);
                } else if (medianValue < value) {
                    // narrowing range to upper half
                    return this.spliceIndexOf(value, medianPos, end);
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
