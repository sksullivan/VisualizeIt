'use strict';

var toolPaneText = '{"hash":{"_id":"5524cc8a86a1d7b50b6f380d","fullName":"flat geom.ply","name":"flat","description":"Basic, flat rectangle geometry generator.","type":"generator","file":"geom.ply","__v":0},"x":0,"y":0},{"hash":{"_id":"5524cc8a86a1d7b50b6f380e","fullName":"flat vertex.shader","name":"flat","description":"Simplest vertex shader.","type":"filter","file":"vertex.shader","__v":0},"x":0,"y":0},{"hash":{"_id":"5524cc8a86a1d7b50b6f380f","fullName":"flat fragment.shader","name":"flat","description":"Simplest fragment shader.","type":"filter","file":"fragment.shader","__v":0},"x":0,"y":0}]"';

describe('Designer View', function () {
  var page;

  beforeEach(function () {
    browser.get('/designer');
    page = require('./main.po');
  });

  it('should include tool pane with correct data', function () {
    expect(page.toolPane.getText()).toBe(toolPaneText);
  });

  it('should include preview and flowchart canvas', function () {
    expect(page.preview.isPresent()).toBe(true);
    expect(page.flowchart.isPresent()).toBe(true);
  });
});
