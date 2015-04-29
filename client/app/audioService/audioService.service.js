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
        //this.loadSound(this.playSound);
      } catch(e) {
        console.log(e);
        alert('Web Audio API is not supported in this browser');
      }

      this.update();
    };

    this.setSound = function (sound) {
      console.log(sound);
      var fileReader = new FileReader();
      var that = this;
      fileReader.onload = function () {
        that.rawData = fileReader.result;
        that.replay();
      };
      fileReader.readAsArrayBuffer(sound);
    };

    this.pulseIntervalElapsedFrames = -100;
    this.beatCounter = 0;
    var lastCalledTime;
    this.fps = 0;
    this.update = function () {
      // Schedule the next update
      requestAnimationFrame(this.update.bind(this));
  
      if(!lastCalledTime) {
        lastCalledTime = Date.now();
        this.fps = 0;
        return;
      }

      var delta = (new Date().getTime() - lastCalledTime)/1000;
      lastCalledTime = Date.now();
      this.fps = 1/delta;


      if (this.pulseIntervalElapsedFrames > this.framesPerPulseInterval) {
        this.pulseIntervalElapsedFrames = 0;
        this.beatCounter++;
        console.log("beat");
      } else {
        this.pulseIntervalElapsedFrames++;
      }


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
        
        frequencyData = new Uint8Array(this.analyzerNode.frequencyBinCount);
        this.analyzerNode.getByteFrequencyData(frequencyData);
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
      } else if (section == "low") {
        return this.lowValue;
      } else {
        return this.beatCounter;
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
        
        var offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);

          // Create buffer source
        var source = offlineContext.createBufferSource();
        source.buffer = buffer;

          // Create filter
        var filter = offlineContext.createBiquadFilter();
        filter.type = "lowpass";

          // Pipe the song into the filter, and the filter into the offline context
        source.connect(filter);
        filter.connect(offlineContext.destination);

          // Schedule the song to start playing at time:0
        source.start(0);

          // Render the song
        offlineContext.startRendering();
        console.log("analyzing");
          // Act on the result
        offlineContext.oncomplete = function(e) {
            // Filtered buffer!
          console.log("analyzed");
          var filteredBuffer = e.renderedBuffer;

          var peaks,
              initialThresold = 0.9,
              thresold = initialThresold,
              minThresold = 0.3,
              minPeaks = 30;

          do {
            peaks = getPeaksAtThreshold(e.renderedBuffer.getChannelData(0), thresold);
            thresold -= 0.05;
          } while (peaks.length < minPeaks && thresold >= minThresold);

          var intervals = countIntervalsBetweenNearbyPeaks(peaks);

          var groups = groupNeighborsByTempo(intervals, filteredBuffer.sampleRate);

          var top = groups.sort(function(intA, intB) {
            return intB.count - intA.count;
          }).splice(0,5);
          that.bpm = Math.round(top[0].tempo);
          that.framesPerPulseInterval = 60*60/that.bpm;
          console.log(that.framesPerPulseInterval);
        };
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
    };

    this.setCanvas = function (canvas) {
       this.canvas = canvas;
    };

    this.init();

// Function to identify peaks
function getPeaksAtThreshold(data, threshold) {
  var peaksArray = [];
  var length = data.length;
  for(var i = 0; i < length;) {
    if (data[i] > threshold) {
      peaksArray.push(i);
      // Skip forward ~ 1/4s to get past this peak.
      i += 10000;
    }
    i++;
  }
  return peaksArray;
}

// Function used to return a histogram of peak intervals
function countIntervalsBetweenNearbyPeaks(peaks) {
  var intervalCounts = [];
  peaks.forEach(function(peak, index) {
    for(var i = 0; i < 10; i++) {
      var interval = peaks[index + i] - peak;
      var foundInterval = intervalCounts.some(function(intervalCount) {
        if (intervalCount.interval === interval)
          return intervalCount.count++;
      });
      if (!foundInterval) {
        intervalCounts.push({
          interval: interval,
          count: 1
        });
      }
    }
  });
  return intervalCounts;
}

// Function used to return a histogram of tempo candidates.
function groupNeighborsByTempo(intervalCounts, sampleRate) {
  var tempoCounts = [];
  intervalCounts.forEach(function(intervalCount, i) {
    if (intervalCount.interval !== 0) {
      // Convert an interval to tempo
      var theoreticalTempo = 60 / (intervalCount.interval / sampleRate );

      // Adjust the tempo to fit within the 90-180 BPM range
      while (theoreticalTempo < 90) theoreticalTempo *= 2;
      while (theoreticalTempo > 180) theoreticalTempo /= 2;

      theoreticalTempo = Math.round(theoreticalTempo);
      var foundTempo = tempoCounts.some(function(tempoCount) {
        if (tempoCount.tempo === theoreticalTempo)
          return tempoCount.count += intervalCount.count;
      });
      if (!foundTempo) {
        tempoCounts.push({
          tempo: theoreticalTempo,
          count: intervalCount.count
        });
      }
    }
  });
  return tempoCounts;
}

  });
