/*global dessert, troop, sntls */
troop.promise(sntls, 'OrderedStringList', function () {
    "use strict";

    /**
     * @class sntls.OrderedStringList
     * @extends sntls.OrderedList
     */
    sntls.OrderedStringList = sntls.OrderedList.extend()
        .addPrivateMethod(/** @lends sntls.OrderedStringList */{
            /**
             * Calculates range search end value for prefix search based on start value.
             * Increments char code on the string's last character.
             * @param {string} startValue
             * @return {String} Calculated end value
             * @private
             */
            _getEndValue: function (startValue) {
                return startValue.slice(0, -1) + String.fromCharCode(startValue.substr(-1).charCodeAt(0) + 1);
            },

            /**
             * Returns lowest value string that is higher than the input.
             * @param {string} startValue
             * @return {string}
             * @private
             */
            _getNextValue: function (startValue) {
                return startValue + String.fromCharCode(0);
            }
        })
        .addMethod(/** @lends sntls.OrderedStringList */{
            /**
             * @name sntls.OrderedStringList.create
             * @return {sntls.OrderedStringList}
             */

            /**
             * Retrieves a range of items that match the specified prefix.
             * @param {string} prefix
             * @param {boolean} [excludeOriginal=false] Whether to exclude `prefix` from the results
             * @return {string[]}
             */
            getRangeByPrefix: function (prefix, excludeOriginal) {
                dessert
                    .assert(typeof prefix === 'string' && prefix.length > 0, "Empty prefix")
                    .isBooleanOptional(excludeOriginal);

                var startValue = excludeOriginal ?
                        this._getNextValue(prefix) :
                        prefix,
                    endValue = this._getEndValue(prefix);

                return this.getRange(startValue, endValue);
            },

            /**
             * Removes all occurrence of a specific string from the list.
             * @param {string} value
             * @return {sntls.OrderedStringList}
             */
            removeAll: function (value) {
                dessert.isString(value);
                this.removeRange(value, this._getNextValue(value));
                return this;
            }
        });
});

(function () {
    "use strict";

    /**
     * @return {sntls.OrderedStringList}
     */
    Array.prototype.toOrderedStringList = function () {
        return sntls.OrderedStringList.create(this);
    };
}());
