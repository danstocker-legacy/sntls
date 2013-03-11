/**
 * Profiled Trait
 *
 * Profiled objects expose a profile (collection) object to keep score
 * on the actions of that object.
 */
/* global dessert, troop, sntls */
troop.promise(sntls, 'Profiled', function (sntls) {
    /**
     * @class sntls.Profiled
     * @extends troop.Base
     */
    sntls.Profiled = troop.Base.extend()
        .addMethod(/** @lends sntls.Profiled */{
            /**
             * Initializes a profiled instance
             * @param {string} profileId Identifier for profile in profiles
             * @param {sntls.ProfileCollection} [profiles] Profile collection to which the present
             * instance contributes to.
             */
            initProfiled: function (profileId, profiles) {
                dessert
                    .isString(profileId, "Invalid profile ID")
                    .isProfileCollectionOptional(profiles, "Invalid profile collection");

                this.addConstant(/** @lends sntls.Profiled */{
                    /**
                     * Cloning passed profile collection or creating new
                     * @type {sntls.ProfileCollection}
                     */
                    profile: (profiles ? profiles.clone() : sntls.ProfileCollection.create())
                        // adding new profile for this instance
                        .setItem(profileId, sntls.Profile.create())
                });

                return this;
            },

            /**
             * Simple getter for the instance profile.
             * For gathering profiles from a collection of Profiled instances.
             * @return {sntls.ProfileCollection}
             */
            getProfile: function () {
                return this.profile;
            }
        });
});
