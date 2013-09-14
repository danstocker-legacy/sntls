/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var params = {
        files: [
            'js/namespace.js',
            'js/Utils.js',
            'js/data/Hash.js',
            'js/data/Dictionary.js',
            'js/data/StringDictionary.js',
            'js/data/Collection.js',
            'js/data/JournalingCollection.js',
            'js/data/OrderedList.js',
            'js/data/OrderedStringList.js',
            'js/data/Set.js',
            'js/tree/Path.js',
            'js/tree/KeyValuePattern.js',
            'js/tree/Query.js',
            'js/tree/TreeWalker.js',
            'js/tree/IterativeTreeWalker.js',
            'js/tree/RecursiveTreeWalker.js',
            'js/tree/Tree.js',
            'js/behavior/Profile.js',
            'js/behavior/Profiled.js',
            'js/behavior/StateMatrix.js',
            'js/behavior/Stateful.js',
            'js/behavior/Documented.js',
            'js/behavior/Managed.js',
            'js/behavior/Lineage.js',
            'js/behavior/Progenitor.js',
            'js/data/collections/ArrayCollection.js',
            'js/data/collections/DateCollection.js',
            'js/data/collections/StringCollection.js',
            'js/exports.js'
        ],

        test: [
            'js/jsTestDriver.conf',
            'js/data/jsTestDriver.conf',
            'js/tree/jsTestDriver.conf',
            'js/behavior/jsTestDriver.conf'
        ],

        globals: {
            dessert: true,
            troop  : true
        }
    };

    // invoking common grunt process
    require('common-gruntfile')(grunt, params);
};
