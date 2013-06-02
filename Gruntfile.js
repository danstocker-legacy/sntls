/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var params = {
        files: [
            'js/license.js',
            'js/namespace.js',
            'js/utils.js',
            'js/data/Hash.js',
            'js/data/Dictionary.js',
            'js/data/StringDictionary.js',
            'js/data/Collection.js',
            'js/data/JournalingCollection.js',
            'js/data/OrderedList.js',
            'js/data/OrderedStringList.js',
            'js/data/Path.js',
            'js/data/Tree.js',
            'js/data/collections/ArrayCollection.js',
            'js/data/collections/DateCollection.js',
            'js/data/collections/StringCollection.js',
            'js/behavior/Profile.js',
            'js/behavior/Profiled.js',
            'js/behavior/StateMatrix.js',
            'js/behavior/Stateful.js',
            'js/exports.js'
        ],

        test: [
            'js/behavior/jsTestDriver.conf',
            'js/data/jsTestDriver.conf',
            'js/jsTestDriver.conf'
        ],

        globals: {
            dessert: true,
            troop  : true
        }
    };

    // invoking common grunt process
    require('common-gruntfile')(grunt, params);
};
