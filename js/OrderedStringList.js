/*global dessert, troop, sntls */
troop.promise(sntls, 'OrderedStringList', function () {
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
             * @return {string[]}
             */
            getRangeByPrefix: function (prefix) {
                dessert.assert(typeof prefix === 'string' && prefix.length > 0, "Empty prefix");
                return this.getRange(prefix, this._getEndValue(prefix));
            },

            /**
             * Removes all occurrence of a specific string from the list.
             * @param {string} value
             * @return {sntls.OrderedStringList}
             */
            removeAll: function (value) {
                dessert.isString(value);
                this.removeRange(value, value + String.fromCharCode(0));
                return this;
            }
        });
});
