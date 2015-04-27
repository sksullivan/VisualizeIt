'use strict';

angular.module('vizualizeItApp')
  .service('audioService', function ($http) {
    this.context = null;
    this.buffer = null;
    this.canvas = null;

    this.init = function () {
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.loadSound(this.playSound);
      } catch(e) {
        console.log(e);
        alert('Web Audio API is not supported in this browser');
      }
    };
  
    this.process = function (data) {
      var source = this.context.createBufferSource(); // Create Sound Source
      var that = this;
      this.context.decodeAudioData(data, function(buffer){
        source.buffer = buffer;
        source.connect(that.context.destination); 
        that.buffer = buffer;
        //source.start(that.context.currentTime);
        //that.analyze();
      });
    };

    this.loadSound = function (decodedSongCallback) {
      
      var audioServiceThis = this;

      var request = new XMLHttpRequest();
      request.open("GET", "/music", true); 
      request.responseType = "arraybuffer"; 

      request.onload = function () {
        var data = request.response;
        audioServiceThis.process(data);
      }
      request.send();
    };

    this.analyze = function () {
      var ccontext = this.canvas.getContext('2d');
      ccontext.beginPath();
      ccontext.moveTo(100, 150);
      ccontext.lineTo(450, 50);
      ccontext.stroke();
      //this.buffer
    };

    this.setCanvas = function (canvas) {
       this.canvas = canvas;
    };

    this.init(); 
     
  });
