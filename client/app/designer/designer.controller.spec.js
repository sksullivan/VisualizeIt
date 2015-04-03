'use strict';

describe('Controller: DesignerCtrl', function () {

  // load the controller's module
  beforeEach(module('vizualizeItApp'));

  var DesignerCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DesignerCtrl = $controller('DesignerCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
