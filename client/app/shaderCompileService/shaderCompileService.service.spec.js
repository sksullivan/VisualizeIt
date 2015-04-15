'use strict';

describe('Service: shaderCompileService', function () {

  // load the service's module
  beforeEach(module('vizualizeItApp'));

  // instantiate service
  var shaderCompileService;
  beforeEach(inject(function (_shaderCompileService_) {
    shaderCompileService = _shaderCompileService_;
  }));

  it('should do something', function () {
    expect(!!shaderCompileService).toBe(true);
  });

});
