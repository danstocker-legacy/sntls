/**
 * Ordered List
 *
 * Inserts, deletes, searches in an ordered list
 * of strings or numbers.
 */
/*global dessert, troop, sntls */
troop.postpone(sntls, 'OrderedList', function () {
    "use strict";

    var base = sntls.Hash;

    /**
     * @class sntls.OrderedList
     * @extends sntls.Hash
     */
    sntls.OrderedList = base.extend()
        .addPrivateMethods(/** @lends sntls.OrderedList */{
            /**
             * Compares numbers. To be supplied to Array.sort().
             * @private
             * @static
             */
            _compareNumbers: function (a, b) {
                return a > b ? 1 : a < b ? -1 : 0;
            }
        })
        .addMethods(/** @lends sntls.OrderedList */{
            /**
             * @name sntls.OrderedList.create
             * @returns {sntls.OrderedList}
             */

            /**
             * @param {string[]|number[]} [items] Initial values
             * @see sntls.Hash.init
             */
            init: function (items) {
                dessert.isArrayOptional(items, "Invalid items");

                // preparing items buffer
                items = items || [];
                if (items.length) {
                    // sorting items
                    items.sort(typeof items[0] === 'number' ?
                        this._compareNumbers :
                        undefined
                    );
                }

                /**
                 * @name sntls.OrderedList.items
                 * @type {string[]|number[]}
                 */

                base.init.call(this, items);
            },

            //////////////////////////////
            // Querying

            /**
             * Performs binary search on items and returns the lowest index where a given value
             * would be spliced into the list. For exact hits, this is the actual position,
             * but no information is given whether the value is present in the list.
             * @param {string|number} value List item value.
             * @param {number} [start=0] Start position of search range. Default: 0.
             * @param {number} [end] Ending position of search range. Default: this.length - 1.
             * @returns {number}
             */
            spliceIndexOf: function (value, start, end) {
                var items = this.items,
                    medianPos, // position of the median within range
                    medianValue; // median value within range

                start = start || 0;
                end = end || items.length;

                medianPos = Math.floor((start + end) / 2);
                medianValue = items[medianPos];

                if (items[start] >= value) {
                    // out of range hit
                    return start;
                } else if (end - start <= 1) {
                    // between two adjacent values
                    return end;
                } else if (medianValue >= value) {
                    // narrowing range to lower half
                    return this.spliceIndexOf(value, start, medianPos);
                } else if (medianValue < value) {
                    // narrowing range to upper half
                    return this.spliceIndexOf(value, medianPos, end);
                }

                // default index, should never be reached
                return -1;
            },

            /**
             * Returns list items starting from startValue up to but not including endValue.
             * @param {string|number} startValue
             * @param {string|number} endValue
             * @returns {Array} Shallow copy of the array's affected segment.
             */
            getRange: function (startValue, endValue) {
                var startIndex = this.spliceIndexOf(startValue),
                    endIndex = this.spliceIndexOf(endValue);

                return this.items.slice(startIndex, endIndex);
            },

            /**
             * Retrieves a range of values and wraps it in a Hash object.
             * @param {string|number} startValue
             * @param {string|number} endValue
             * @returns {sntls.Hash} Hash with a shallow copy of the array's affected segment.
             * @see sntls.OrderedList.getRange
             */
            getRangeAsHash: function (startValue, endValue) {
                var range = this.getRange.apply(this, arguments);
                return sntls.Hash.create(range);
            },

            //////////////////////////////
            // Content manipulation

            /**
             * Inserts a single value into list while retaining order.
             * @param {string|number} value
             * @returns {number} The index at which the item was spliced in.
             */
            addItem: function (value) {
                var spliceIndex = this.spliceIndexOf(value);
                this.items.splice(spliceIndex, 0, value);
                return spliceIndex;
            },

            /**
             * Adds multiple items to list.
             * @param {string[]|number[]} values
             * @returns {sntls.OrderedList}
             */
            addItems: function (values) {
                dessert.isArray(values, "Invalid item values");
                var i;
                for (i = 0; i < values.length; i++) {
                    this.addItem(values[i]);
                }
                return this;
            },

            /**
             * Deletes single value from list while retaining order.
             * @param {string|number} value
             * @returns {number} The index from which the item was removed. -1 if item was not present.
             */
            removeItem: function (value) {
                var items = this.items,
                    spliceIndex = this.spliceIndexOf(value);

                // must check whether value is present
                if (items[spliceIndex] === value) {
                    items.splice(spliceIndex, 1);
                } else {
                    spliceIndex = -1;
                }

                return spliceIndex;
            },

            /**
             * Removes multiple items from list.
             * @param {string[]|number[]} values
             * @returns {sntls.OrderedList}
             */
            removeItems: function (values) {
                dessert.isArray(values, "Invalid item values");
                var i;
                for (i = 0; i < values.length; i++) {
                    this.removeItem(values[i]);
                }
                return this;
            },

            /**
             * Removes a range from the list starting from startValue up to but not including endValue.
             * @param {string|number} startValue
             * @param {string|number} endValue
             * @returns {number} The starting position of removal.
             */
            removeRange: function (startValue, endValue) {
                var startIndex = this.spliceIndexOf(startValue),
                    endIndex = this.spliceIndexOf(endValue),
                    length = endIndex - startIndex;

                if (length > 0) {
                    this.items.splice(startIndex, length);
                }

                return startIndex;
            }

            /**
             * @name sntls.OrderedList.clear
             * @returns {sntls.OrderedList}
             */
        });
});

(function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash */{
        /**
         * @returns {sntls.OrderedList}
         */
        toOrderedList: function () {
            return sntls.OrderedList.create(this.items);
        }
    });
}());
