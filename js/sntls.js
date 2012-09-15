/**
 * Top-Level Library Namespace
 */
/*global exports, require */
/** @namespace */
var sntls = {},
    troop;

// adding Node.js dependencies
if (typeof exports === 'object' && typeof require === 'function') {
    troop = require('troop-0.1.8').troop;
}
