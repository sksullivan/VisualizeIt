'use strict';

angular.module('vizualizeItApp')
  .service('componentLoaderService', function ($http) {
    // Gets list of components.
    this.getComponents = function (componentListCallback) {
        $http.get('/api/components').success(function (data) {
            componentListCallback(data);
        });
    };

    // Gets individual file for a component.
    this.getComponent = function (componentId, componentCallback) {
        $http.get('/api/components/'+componentId).success(function (data) {
            componentCallback(data);
        });
    };
  });
