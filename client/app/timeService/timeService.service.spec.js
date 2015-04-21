'use strict';

describe('Service: timeService', function () {

  // load the service's module
  beforeEach(module('vizualizeItApp'));

  // instantiate service
  var timeService;
  beforeEach(inject(function (_timeService_) {
    timeService = _timeService_;
  }));

  it('should do something', function () {
    expect(!!timeService).toBe(true);
  });

});
