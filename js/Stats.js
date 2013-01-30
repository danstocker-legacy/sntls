/**
 * Statistics
 *
 * Class for collecting multi-level statistics
 */
/*global dessert, troop */
troop.promise('sntls.Stats', function (sntls) {
    sntls.Stats = sntls.Collection.of(sntls.Stat);
});
