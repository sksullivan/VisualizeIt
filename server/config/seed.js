/**
* Populate DB with sample data on server start
* to disable, edit config/environment/index.js, and set `seedDB: false`
*/

'use strict';

var fs = require('fs');

var Component = require('../api/component/component.model');

// Load data into our DB initially.
Component.find({}).remove(function () {

  // Search through the server's assets folder for component directories.
  fs.readdirSync('./server/assets').forEach(function (file) {
    // Read these directories' spec files.
    fs.readFile('./server/assets/'+file+'/component.json', 'utf-8', function (err, data) {
      // Iterate over all components defined in our spec file.
      JSON.parse(data).subComponents.forEach(function (subComponent) {
        // Add an entry in our DB for every file defined by our component.
        subComponent.files.forEach(function (componentFile) {
          Component.create({
            fullName: file+" "+componentFile,
            name: file,
            description: subComponent.description,
            type: subComponent.type,
            file: componentFile
          });
        });
      });
    });
  });
});
