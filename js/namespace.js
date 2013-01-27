/**
 * Top-Level Library Namespace
 */
/*global exports, require */
(function () {
    /** @namespace */
    this.sntls = {};
}());

// adding Node.js dependencies
if (typeof require === 'function') {
    require('dessert-0.2.3');
    require('troop-0.2.3');
}
