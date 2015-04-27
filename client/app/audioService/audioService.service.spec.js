'use strict';

describe('Service: audioService', function () {

  // load the service's module
  beforeEach(module('vizualizeItApp'));

  // instantiate service
  var audioService;
  beforeEach(inject(function (_audioService_) {
    audioService = _audioService_;
  }));

  it('should do something', function () {
    expect(!!audioService).toBe(true);
  });

});
