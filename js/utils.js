/**
 * General Utilities
 */
/*global dessert, troop, sntls */
troop.promise(sntls, 'utils', function (sntls) {
    sntls.utils = troop.Base.extend()
        .addMethod({
            /**
             * Creates a shallow copy of an object.
             * Property names will be copied, but property values
             * will point to the original references.
             * @param original {object}
             */
            shallowCopy: function (original) {
                if (dessert.validators.isArray(original)) {
                    // shorthand for arrays
                    return original.concat([]);
                }

                dessert.isObject(original);

                var propertyNames = Object.getOwnPropertyNames(original),
                    i, propertyName,
                    result = {};

                for (i = 0; i < propertyNames.length; i++) {
                    propertyName = propertyNames[i];
                    result[propertyName] = original[propertyName];
                }

                return result;
            }
        });
});
