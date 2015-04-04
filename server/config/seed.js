/**
* Populate DB with sample data on server start
* to disable, edit config/environment/index.js, and set `seedDB: false`
*/

'use strict';

var fs = require('fs');

var Component = require('../api/component/component.model');

Component.find({}).remove(function () {
  fs.readdirSync('./server/assets').forEach(function (item) {
    fs.readFile('./server/assets/'+item+'/component.json', 'utf-8', function (err, data) {
      JSON.parse(data).subComponents.forEach(function (subComponent) {
        subComponent.files.forEach(function (file) {
          Component.create({
            fullName: item+" "+file,
            name: item,
            description: JSON.parse(data).description,
            file: file
          });
        });
      });
    });
  });
});
