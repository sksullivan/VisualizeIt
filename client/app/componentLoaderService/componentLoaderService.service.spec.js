'use strict';

describe('Service: componentLoaderService', function () {

  // load the service's module
  beforeEach(module('vizualizeItApp'));

  // instantiate service
  var componentLoaderService;
  beforeEach(inject(function (_componentLoaderService_) {
    componentLoaderService = _componentLoaderService_;
  }));

  it('should do something', function () {
    expect(!!componentLoaderService).toBe(true);
  });

});
