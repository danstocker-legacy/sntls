/**
 * Top-Level Library Namespace
 */
/*global require */
/** @namespace */
var sntls = {},
    dessert,
    troop;

// adding Node.js dependencies
if (typeof require === 'function') {
    dessert = require('dessert').dessert;
    troop = require('troop').troop;
}
