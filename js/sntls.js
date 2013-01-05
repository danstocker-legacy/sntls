/**
 * Top-Level Library Namespace
 */
/*global exports, require */
/** @namespace */
var sntls = {},
    dessert,
    troop;

// adding Node.js dependencies
if (typeof exports === 'object' && typeof require === 'function') {
    dessert = require('dessert-0.2.2').dessert;
    troop = require('troop-0.2.2').troop;
}
