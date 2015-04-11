'use strict';

describe('Service: flowchartService', function () {

  // load the service's module
  beforeEach(module('vizualizeItApp'));

  // instantiate service
  var flowchartService;
  beforeEach(inject(function (_flowchartService_) {
    flowchartService = _flowchartService_;
  }));

  it('should do something', function () {
    expect(!!flowchartService).toBe(true);
  });

});
