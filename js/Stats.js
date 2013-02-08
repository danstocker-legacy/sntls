/**
 * Statistics
 *
 * Class for collecting multi-level statistics
 */
/*global dessert, troop */
troop.promise('sntls.Stats', function (sntls) {
    sntls.Stats = sntls.Collection.of(sntls.Profile);

    dessert.addTypes({
        isStats: function (expr) {
            return this.isClass(expr) &&
                   (expr.isA(sntls.Profile) ||
                    expr.isA(sntls.Stats));
        },

        isStatsOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   this.isClass(expr) &&
                   (expr.isA(sntls.Profile) ||
                    expr.isA(sntls.Stats));
        }
    });
});
