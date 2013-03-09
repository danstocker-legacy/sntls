/**
 * Top-Level Library Namespace
 */
/* global require */
/** @namespace */
var sntls = {},
    dessert,
    troop;

// adding Node.js dependencies
if (typeof require === 'function') {
    dessert = require('dessert-0.2.4').dessert;
    troop = require('troop-0.3.0').troop;
}
