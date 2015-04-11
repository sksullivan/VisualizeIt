/**
 * This file uses the Page Object pattern to define the main page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

'use strict';

var DesignerPage = function() {
  this.toolPane = element(by.css('.tool-pane'));
  this.preview = element(by.css('.bottom-pane'));
  this.flowchart = element(by.css('.top-pane'));
};

module.exports = new DesignerPage();
