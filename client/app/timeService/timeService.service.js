'use strict';

angular.module('vizualizeItApp')
  .service('timeService', function () {
    var elapsedFrames = 0;
    var newFrameCallback = null;

    var requestFrame = function () {
      elapsedFrames++;
      if (newFrameCallback != null) {
        //newFrameCallback();
      }
      window.requestAnimationFrame(requestFrame);
    };
    window.requestAnimationFrame(requestFrame);


    this.getElapsedFrames = function () {
      return elapsedFrames;
    }

    this.registerNewFrameCallback = function (callback) {
      newFrameCallback = callback;
    }
  });
