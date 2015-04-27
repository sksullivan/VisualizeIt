/**
* Populate DB with sample data on server start
* to disable, edit config/environment/index.js, and set `seedDB: false`
*/

'use strict';

var fs = require('fs');

var Component = require('../api/component/component.model');
var Song = require('../api/song/song.model.js');

// Load data into our DB initially.
Component.find({}).remove(function () {

  // Search through the server's assets folder for component directories.
  fs.readdirSync('./server/assets').forEach(function (file) {
    // Read these directories' spec files.
    fs.readFile('./server/assets/'+file+'/component.json', 'utf-8', function (err, data) {
      // Iterate over all components defined in our spec file.
      if (err) {
        return;
      }
      JSON.parse(data).subComponents.forEach(function (subComponent) {
        // Add an entry in our DB for every file defined by our component.
        subComponent.files.forEach(function (componentFile) {
          Component.create({
            fullName: file+" "+componentFile,
            name: file,
            description: subComponent.description,
            dataType: subComponent.dataType,
            file: componentFile
          });
        });
      });
    });
  });
});

Song.find({}).remove(function () {
  fs.readdirSync('./server/assets/music').forEach(function (file) { 
    console.log(file);
    fs.readFile('./server/assets/music/'+file,'binary', function (err, data) {
      if (err) {
        return;
      }
      console.log(file);
      if (file == "sweep.mp3") {
        Song.create({
          name: file,
          data: data
        });
      }
    });
  });
});
