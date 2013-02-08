/**
 * Profiled Trait
 *
 * TracedProfiled objects expose a statistics object to keep score
 * on the actions of that object.
 */
/*global dessert, troop */
troop.promise('sntls.Profiled', function (sntls) {
    var self = sntls.Profiled = troop.Base.extend()
        .addMethod({
            /**
             * Initializes a profiled instance
             * @param profileId {string} Identifier for profile in profiles
             * @param profiles {Stats} Profile collection to which the present
             * instance contributes to.
             */
            initProfiled: function (profileId, profiles) {
                dessert.isStatsOptional(profiles);

                this.addConstant({
                    stats: (profiles ? profiles.clone() : sntls.Stats.create())
                        .set(profileId, sntls.Profile.create())
                });

                return this;
            }
        });
});
