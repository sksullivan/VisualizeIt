'use strict';

describe('Service: designerService', function () {

  // load the service's module
  beforeEach(module('vizualizeItApp'));

  // instantiate service
  var designerService;
  beforeEach(inject(function (_designerService_) {
    designerService = _designerService_;
  }));

  it('should do something', function () {
    expect(!!designerService).toBe(true);
  });

});
