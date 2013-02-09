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
             * @param [profiles] {Profiles} Profile collection to which the present
             * instance contributes to.
             */
            initProfiled: function (profileId, profiles) {
                dessert
                    .isString(profileId)
                    .isProfilesOptional(profiles);

                this.addConstant({
                    /**
                     * Cloning passed profile collection or creating new
                     * @type {Profiles}
                     */
                    profile: (profiles ? profiles.clone() : sntls.Profiles.create())
                        // adding new profile for this instance
                        .set(profileId, sntls.Profile.create())
                });

                return this;
            }
        });
});
