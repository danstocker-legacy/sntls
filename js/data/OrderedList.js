/*global dessert, troop, sntls */
troop.postpone(sntls, 'OrderedList', function () {
    "use strict";

    var base = sntls.Hash;

    /**
     * Instantiates class.
     * Sets the list up with initial items.
     * @name sntls.OrderedList.create
     * @function
     * @param {string[]|number[]} [items] Initial values: array of strings or numbers.
     * @param {boolean} [reversed=false] Whether order is reversed.
     * @returns {sntls.OrderedList}
     */

    /**
     * Manages a list of strings or numbers and keeps it prepared for quick access and queries.
     * @class sntls.OrderedList
     * @extends sntls.Hash
     */
    sntls.OrderedList = base.extend()
        .addPrivateMethods(/** @lends sntls.OrderedList */{
            /**
             * Compares numbers in ascending order. To be supplied to Array.sort().
             * @private
             */
            _compareAscending: function (a, b) {
                return a > b ? 1 : a < b ? -1 : 0;
            },

            /**
             * Compares numbers in descending order. To be supplied to Array.sort().
             * @private
             */
            _compareDescending: function (a, b) {
                return b > a ? 1 : b < a ? -1 : 0;
            },

            /**
             * Gets splice index for ascending order.
             * @param {string|number} value
             * @param {number} start
             * @param {number} end
             * @returns {number}
             * @private
             */
            _spliceIndexOfAsc: function (value, start, end) {
                var items = this.items,
                    medianPos = Math.floor((start + end) / 2), // position of the median within range
                    medianValue = items[medianPos]; // median value within range

                if (items[start] >= value) {
                    // out of range hit
                    return start;
                } else if (end - start <= 1) {
                    // between two adjacent values
                    return end;
                } else if (medianValue >= value) {
                    // narrowing range to lower half
                    return this._spliceIndexOfAsc(value, start, medianPos);
                } else if (medianValue < value) {
                    // narrowing range to upper half
                    return this._spliceIndexOfAsc(value, medianPos, end);
                }

                // default index, should never be reached
                return -1;
            },

            /**
             * Gets splice index for descending order.
             * Same as sntls.OrderedList#_spliceIndexOfAsc but with value comparisons flipped.
             * @param {string|number} value
             * @param {number} start
             * @param {number} end
             * @returns {number}
             * @private
             * @see sntls.OrderedList#_spliceIndexOfAsc
             */
            _spliceIndexOfDesc: function (value, start, end) {
                var items = this.items,
                    medianPos = Math.floor((start + end) / 2), // position of the median within range
                    medianValue = items[medianPos]; // median value within range

                if (items[start] <= value) {
                    // out of range hit
                    return start;
                } else if (end - start <= 1) {
                    // between two adjacent values
                    return end;
                } else if (medianValue <= value) {
                    // narrowing range to lower half
                    return this._spliceIndexOfDesc(value, start, medianPos);
                } else if (medianValue > value) {
                    // narrowing range to upper half
                    return this._spliceIndexOfDesc(value, medianPos, end);
                }

                // default index, should never be reached
                return -1;
            }
        })
        .addMethods(/** @lends sntls.OrderedList# */{
            /**
             * @param {string[]|number[]} [items]
             * @param {boolean} [reversed=false]
             * @ignore
             */
            init: function (items, reversed) {
                dessert.isArrayOptional(items, "Invalid items");

                // preparing items buffer
                items = items || [];
                if (items.length) {
                    // sorting items
                    items.sort(reversed ? this._compareDescending : this._compareAscending);
                }

                /**
                 * @name sntls.OrderedList#items
                 * @type {string[]|number[]}
                 */

                base.init.call(this, items);

                /**
                 * Whether order is reversed.
                 * @type {boolean}
                 */
                this.reversed = !!reversed;
            },

            //////////////////////////////
            // Querying

            /**
             * Performs binary search on the list's sorted array buffer and returns the lowest index where
             * a given value would be spliced into or out of the list. For exact hits, this is the actual position,
             * but no information is given whether the value is present in the list or not.
             * @example
             * var ol = sntls.OrderedList.create(['foo', 'bar', 'bee']);
             * ol.spliceIndexOf('bee') // 1
             * ol.spliceIndexOf('ban') // 0
             * ol.spliceIndexOf('fun') // 3
             * @param {string|number} value List item value.
             * @param {number} [start=0] Start position of search range. Default: 0.
             * @param {number} [end] Ending position of search range. Default: this.items.length - 1.
             * @returns {number}
             */
            spliceIndexOf: function (value, start, end) {
                start = start || 0;
                end = end || this.items.length;

                return this.reversed ?
                    this._spliceIndexOfDesc(value, start, end) :
                    this._spliceIndexOfAsc(value, start, end);
            },

            /**
             * Returns list items in a sorted array starting from `startValue` up to but not including `endValue`.
             * @example
             * var ol = sntls.OrderedList.create(['foo', 'bar', 'ban', 'bee']);
             * ol.getRange('bar', 'foo') // ['bar', 'bee', 'foo']
             * ol.getRange('a', 'bee') // ['ban', 'bar', 'bee']
             * ol.getRange('foo', 'fun') // ['foo']
             * @param {string|number} startValue Value marking start of the range.
             * @param {string|number} endValue Value marking end of the range.
             * @param {number} [offset=0] Number of items to skip at start.
             * @param {number} [limit=Infinity] Number of items to fetch at most.
             * @returns {Array} Shallow copy of the array's affected segment.
             */
            getRange: function (startValue, endValue, offset, limit) {
                offset = offset || 0;
                limit = typeof limit === 'undefined' ? Infinity : limit;

                var startIndex = this.spliceIndexOf(startValue),
                    endIndex = this.spliceIndexOf(endValue);

                return this.items.slice(startIndex + offset, Math.min(endIndex, startIndex + offset + limit));
            },

            /**
             * Retrieves a range of values and wraps it in a Hash object.
             * @param {string|number} startValue Value marking start of the range.
             * @param {string|number} endValue Value marking end of the range.
             * @param {number} [offset=0] Number of items to skip at start.
             * @param {number} [limit=Infinity] Number of items to fetch at most.
             * @returns {sntls.Hash} Hash with a shallow copy of the array's affected segment.
             * @see sntls.OrderedList#getRange
             */
            getRangeAsHash: function (startValue, endValue, offset, limit) {
                var range = this.getRange.apply(this, arguments);
                return sntls.Hash.create(range);
            },

            //////////////////////////////
            // Content manipulation

            /**
             * Adds a single value to the list and returns the position where the value was inserted.
             * @example
             * var ol = sntls.OrderedList.create(['b', 'c']);
             * var pos = ol.addItem('a');
             * pos // 0
             * ol.items // ['a', 'b', 'c']
             * @param {string|number} value Value to be inserted.
             * @returns {number} Array index of the inserted item.
             */
            addItem: function (value) {
                var spliceIndex = this.spliceIndexOf(value);
                this.items.splice(spliceIndex, 0, value);
                return spliceIndex;
            },

            /**
             * Adds multiple values to the list.
             * @param {string[]|number[]} values Array of values to be inserted.
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
             * Removes the first available item matching the value and returns the affected position.
             * Returns -1 when the value is not present in the list.
             * @example
             * var ol = sntls.OrderedList.create(['b', 'c', 'a']);
             * var pos = ol.removeItem('b');
             * pos // 1
             * ol.items // ['a', 'c']
             * @param {string|number} value Value to be removed.
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
             * Removes all items specified in `values`.
             * @param {string[]|number[]} values Array of values to be removed.
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
             * Removes a range from the list starting from startValue up to but not including endValue, and
             * returns the index at which actual removal began.
             * Neither `startValue` nor `endValue` has to be present in the list.
             * @param {string|number} startValue Lower bound for range.
             * @param {string|number} endValue Upper bound for range.
             * @returns {number} Actual starting index of removal. -1 if no item matched the specified range.
             */
            removeRange: function (startValue, endValue) {
                var startIndex = this.spliceIndexOf(startValue),
                    endIndex = this.spliceIndexOf(endValue),
                    length = endIndex - startIndex;

                if (length > 0) {
                    this.items.splice(startIndex, length);
                    return startIndex;
                } else {
                    return -1;
                }
            }

            /**
             * Clears the list.
             * @name sntls.OrderedList#clear
             * @function
             * @returns {sntls.OrderedList}
             */
        });
});

troop.amendPostponed(sntls, 'Hash', function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash# */{
        /**
         * Reinterprets hash as an ordered list.
         * @returns {sntls.OrderedList}
         */
        toOrderedList: function () {
            return sntls.OrderedList.create(this.items);
        }
    });
});

(function () {
    "use strict";

    troop.Properties.addProperties.call(
        Array.prototype,
        /** @lends Array# */{
            /**
             * Creates a new OrderedList instance based on the current array.
             * @returns {sntls.OrderedList}
             */
            toOrderedList: function () {
                return sntls.OrderedList.create(this);
            }
        },
        false, false, false
    );
}());
