'use strict';

angular.module('vizualizeItApp')
  .service('audioService', function ($http, timeService) {
    this.context = null;
    this.buffer = null;
    this.canvas = null;
    this.rawBuffer = null;
    this.analyzerNode = null;
    this.source = null;
    this.rawData = null;

    this.lowValue = 0;
    this.midValue = 0;
    this.highValue = 0;

    this.init = function () {
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.loadSound(this.playSound);
      } catch(e) {
        console.log(e);
        alert('Web Audio API is not supported in this browser');
      }

      this.update();
    };

    this.update = function () {
      // Schedule the next update
      requestAnimationFrame(this.update.bind(this));

      var line = function (xo,yo,x,y) {
        ccontext.beginPath();
        ccontext.moveTo(xo, yo);
        ccontext.lineTo(x, y);
        ccontext.stroke();
      }

      // Get the new frequency data
      var frequencyData;
      if (this.analyzerNode !== null) {
        var ccontext = this.canvas.getContext('2d');
        var viewWidth = this.canvas.width;

        ccontext.clearRect ( 0 , 0 , this.canvas.width, this.canvas.height );

        var timeWidthDelta = viewWidth / (this.buffer.duration*60);
        line(0,0,timeService.getElapsedFrames()*timeWidthDelta,0);

        frequencyData = new Uint8Array(this.analyzerNode.frequencyBinCount);
        this.analyzerNode.getByteFrequencyData(frequencyData);

        var peakMarkerDelta = viewWidth / frequencyData.length;
        for (var i = 0; i < frequencyData.length; i++) {
          if (frequencyData[20] > 100) {
            line(i * peakMarkerDelta, 0, i * peakMarkerDelta, 100);
          }
        }
        this.lowValue = frequencyData[3];
        this.midValue = frequencyData[16];
        this.highValue = frequencyData[30];
      }
    };

    this.replay = function () {
      this.process(this.rawData);
    }

    this.getValue = function (section) {
      if (section == "high") {
        return this.highValue;
      } else if (section == "mid") {
        return this.midValue;
      } else {
        return this.lowValue;
      }
    }

    this.process = function (data) {
      this.source = this.context.createBufferSource(); // Create Sound Source
      this.analyzerNode = this.context.createAnalyser();
      var that = this;
      this.context.decodeAudioData(data, function(buffer){
        that.source.buffer = buffer;
        that.source.connect(that.analyzerNode);
        that.analyzerNode.connect(that.context.destination);
        that.buffer = buffer;
        that.source.start(that.context.currentTime);
        that.analyze();
      });
    };

    this.loadSound = function (decodedSongCallback) {

      var that = this;

      var request = new XMLHttpRequest();
      request.open("GET", "/music", true);
      request.responseType = "arraybuffer";

      request.onload = function () {
        that.rawData = request.response;
        that.rawBuffer = new Uint8Array(that.rawData);
        that.process(that.rawData);
      }
      request.send();
    };

    this.analyze = function () {
      this.analyzerNode.fftSize = 64;

      var ccontext = this.canvas.getContext('2d');
      var viewWidth = this.canvas.width;
      var line = function (xo,yo,x,y) {
        ccontext.beginPath();
        ccontext.moveTo(xo, yo);
        ccontext.lineTo(x, y);
        ccontext.stroke();
      }

      var threshold = 0.95;
      var peaksArray = [];
      for (var i = 0; i < this.rawBuffer.length; i++) {
        //console.log(this.rawBuffer[i]);
        if (this.rawBuffer[i] > 254) {
          peaksArray.push(i);
          i += 1000;
        }
      }

      var peakMarkerDelta = viewWidth / this.rawBuffer.length;
      for (let peakIndex of peaksArray) {
        line(peakIndex * peakMarkerDelta, 0, peakIndex * peakMarkerDelta, 100);
      }
    };

    this.setCanvas = function (canvas) {
       this.canvas = canvas;
    };

    this.init();

  });
