/**
 * Profiles
 *
 * Collection of profile instances. Aggregates profile information
 * about multiple objects.
 */
/*global dessert, troop */
troop.promise('sntls.Profiles', function (sntls) {
    sntls.Profiles = sntls.Collection.of(sntls.Profile);

    dessert.addTypes({
        isProfiles: function (expr) {
            return this.isClass(expr) &&
                   (expr.isA(sntls.Profile) ||
                    expr.isA(sntls.Profiles));
        },

        isProfilesOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   this.isClass(expr) &&
                   (expr.isA(sntls.Profile) ||
                    expr.isA(sntls.Profiles));
        }
    });
});
