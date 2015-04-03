'use strict';

angular.module('vizualizeItApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/designer', {
        templateUrl: 'app/designer/designer.html',
        controller: 'DesignerCtrl'
      });
  });
