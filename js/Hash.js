/*global dessert, troop, sntls */
troop.promise(sntls, 'Hash', function () {
    dessert.addTypes(/** @lends dessert */{
        isHash: function (expr) {
            return sntls.Hash.isBaseOf(expr);
        },

        isHashOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   sntls.Hash.isBaseOf(expr);
        }
    });

    /**
     * @class sntls.Hash
     * @extends troop.Base
     */
    sntls.Hash = troop.Base.extend()
        .addMethod(/** @lends sntls.Hash */{
            /**
             * @param {object} items Hash items
             */
            init: function (items) {
                dessert.isObjectOptional(items, "Invalid initial hash items");

                this.addPublic(/** @lends sntls.Hash */{
                    items: items || {}
                });
            },

            /**
             * Adds item to hash
             * @param {string} key
             * @param {string|string[]} value
             */
            addItem: function (key, value) {
                var items = this.items,
                    currentValue = items[key];

                switch (typeof currentValue) {
                case 'undefined':
                    // current item does not exist
                    items[key] = value instanceof Array ?
                        value.length === 1 ?
                            value[0] :
                            value :
                        value;
                    break;

                case 'string':
                    // current item is single string
                    items[key] = value instanceof Array ?
                        [currentValue].concat(value) :
                        items[key] = [currentValue, value];
                    break;

                case 'object':
                    if (currentValue instanceof Array) {
                        // current item is array
                        if (value instanceof Array) {
                            items[key] = currentValue.concat(value);
                        } else {
                            currentValue.push(value);
                        }
                    } else {
                        dessert.assert(false, "Invalid hash value");
                    }
                    break;

                default:
                    dessert.assert(false, "Invalid hash value");
                    break;
                }

                return this;
            },

            /**
             * Retrieves item(s) from the hash
             * @param {string|string[]} key
             */
            getItem: function (key) {
                var result,
                    i, item;

                if (typeof key === 'string') {
                    result = this.items[key];
                } else if (key instanceof Array) {
                    // key may be an array of keys
                    result = [];
                    for (i = 0; i < key.length; i++) {
                        item = this.items[key[i]];
                        if (item) {
                            result = result.concat(item);
                        }
                    }
                } else {
                    dessert.assert(false, "Invalid key");
                }

                return result;
            },

            /**
             * Combines current hash with remote hash
             * @param {sntls.Hash} hash
             * @return {sntls.Hash} combined hash
             */
            combineWith: function (hash) {
                dessert.isHash(hash, "Invalid hash");

                var result = sntls.Hash.create(),
                    keys = Object.keys(this.items),
                    i, key, value;

                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    value = this.getItem(key);
                    // value is the key in remote hash
                    result.addItem(key, hash.getItem(value));
                }

                return result;
            }
        });
});
