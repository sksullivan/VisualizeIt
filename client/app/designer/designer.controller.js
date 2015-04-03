'use strict';

angular.module('vizualizeItApp')
  .controller('DesignerCtrl', function ($scope,designerService) {
    $scope.message = 'Hello';
    designerService.getComponents();
  });
