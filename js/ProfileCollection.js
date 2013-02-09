/**
 * Profile Collection
 *
 * Collection of profile instances. Aggregates profile information
 * about multiple objects.
 */
/*global dessert, troop */
troop.promise('sntls.ProfileCollection', function (sntls) {
    sntls.ProfileCollection = sntls.Collection.of(sntls.Profile);

    dessert.addTypes({
        isProfileCollection: function (expr) {
            return this.isClass(expr) &&
                   (expr.isA(sntls.Profile) ||
                    expr.isA(sntls.ProfileCollection));
        },

        isProfileCollectionOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   this.isClass(expr) &&
                   (expr.isA(sntls.Profile) ||
                    expr.isA(sntls.ProfileCollection));
        }
    });
});
