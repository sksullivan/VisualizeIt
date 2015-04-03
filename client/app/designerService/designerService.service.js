'use strict';

angular.module('vizualizeItApp')
  .service('designerService', function ($http) {
    this.getComponents = function () {
        $http.get('/api/components').success(function (data) {
            console.log(data);
        });
    };
  });
