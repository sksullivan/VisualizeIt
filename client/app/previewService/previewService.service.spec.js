'use strict';

describe('Service: previewService', function () {

  // load the service's module
  beforeEach(module('vizualizeItApp'));

  // instantiate service
  var previewService;
  beforeEach(inject(function (_previewService_) {
    previewService = _previewService_;
  }));

  it('should do something', function () {
    expect(!!previewService).toBe(true);
  });

});
