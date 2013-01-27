/**
 * Top-Level Library Namespace
 */
/*global exports, require */
var sntls,
    dessert,
    troop;

(function () {
    /** @namespace */
    sntls = this.sntls = {};
}());

// adding Node.js dependencies
if (typeof exports === 'object' && typeof require === 'function') {
    dessert = require('dessert-0.2.3').dessert;
    troop = require('troop-0.2.3').troop;
}
