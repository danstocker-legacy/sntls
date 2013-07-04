/*global dessert, troop, sntls */
troop.postpone(sntls, 'Profiled', function (sntls) {
    "use strict";

    /**
     * Trait.
     * Allows objects to be profiled and/or to contribute to profiles of other objects.
     * @class sntls.Profiled
     * @extends troop.Base
     */
    sntls.Profiled = troop.Base.extend()
        .addMethods(/** @lends sntls.Profiled# */{
            /**
             * Initializes profile for the current instance. Creates a `.profile` property on the object.
             * @param {string} profileId String identifying the current object in a profile collection.
             * Each profiled instance is issued a profile collection under its `.profile` property.
             * This way, any contribution to the profile will be reflected in all profiles and consequently those
             * objects by which they were created.
             * @param {sntls.ProfileCollection} [profiles] Optional profile collection. When specified,
             * the current profiled object will add its own profile to this collection. When omitted, a new profile
             * collection will be created with one profile in it.
             */
            initProfiled: function (profileId, profiles) {
                dessert
                    .isString(profileId, "Invalid profile ID")
                    .isProfileCollectionOptional(profiles, "Invalid profile collection");

                /**
                 * Cloning passed profile collection or creating new
                 * @type {sntls.ProfileCollection}
                 */
                this.profile = (profiles ? profiles.clone() : sntls.ProfileCollection.create())
                    // adding new profile for this instance
                    .setItem(profileId, sntls.Profile.create());

                return this;
            },

            /**
             * Gathers profiles from a collection of profiled instances.
             * @returns {sntls.ProfileCollection}
             */
            getProfile: function () {
                return this.profile;
            }
        });
});
