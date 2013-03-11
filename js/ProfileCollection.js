/**
 * Profile Collection
 *
 * Collection of profile instances. Aggregates profile information
 * about multiple objects.
 */
/* global dessert, troop, sntls */
troop.promise(sntls, 'ProfileCollection', function () {
    /**
     * @class sntls.ProfileCollection
     * @extends sntls.Collection
     * @borrows sntls.Profile
     */
    sntls.ProfileCollection = sntls.Collection.of(sntls.Profile);
});

/* global sntls */
dessert.addTypes(/** @lends dessert */{
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
