/**
 * Statistics
 *
 * Class for collecting multi-level statistics
 */
/*global dessert, troop */
troop.promise('sntls.Stats', function (sntls) {
    sntls.Stats = sntls.Collection.of(sntls.Stat);

    dessert.addTypes({
        isStats: function (expr) {
            return this.isClass(expr) &&
                   (expr.isA(sntls.Stat) ||
                    expr.isA(sntls.Stats));
        },

        isStatsOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   this.isClass(expr) &&
                   (expr.isA(sntls.Stat) ||
                    expr.isA(sntls.Stats));
        }
    });
});
