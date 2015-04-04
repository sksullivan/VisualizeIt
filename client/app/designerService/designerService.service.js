'use strict';

angular.module('vizualizeItApp')
  .service('designerService', function ($http) {
    this.getComponents = function (componentListCallback) {
        $http.get('/api/components').success(function (data) {
            componentListCallback(data);
        });
    };

    this.getComponent = function (componentId, componentCallback) {
        $http.get('/api/components/'+componentId).success(function (data) {
            componentCallback(data);
        });
    };
  });
