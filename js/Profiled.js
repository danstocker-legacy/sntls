/**
 * Profiled Trait
 *
 * Profiled objects expose a profile (collection) object to keep score
 * on the actions of that object.
 */
/*global dessert, troop */
troop.promise('sntls.Profiled', function (sntls) {
    var self = sntls.Profiled = troop.Base.extend()
        .addMethod({
            /**
             * Initializes a profiled instance
             * @param profileId {string} Identifier for profile in profiles
             * @param [profiles] {ProfileCollection} Profile collection to which the present
             * instance contributes to.
             */
            initProfiled: function (profileId, profiles) {
                dessert
                    .isString(profileId)
                    .isProfileCollectionOptional(profiles);

                this.addConstant({
                    /**
                     * Cloning passed profile collection or creating new
                     * @type {ProfileCollection}
                     */
                    profile: (profiles ? profiles.clone() : sntls.ProfileCollection.create())
                        // adding new profile for this instance
                        .set(profileId, sntls.Profile.create())
                });

                return this;
            },

            /**
             * Simple getter for the instance profile.
             * For gathering profiles from a collection of Profiled instances.
             * @return {ProfileCollection}
             */
            getProfile: function () {
                return this.profile;
            }
        });
});
