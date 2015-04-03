/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var fs = require('fs');

var Thing = require('../api/thing/thing.model');
var Component = require('../api/component/component.model');

Component.find({}).remove(function () {
    fs.readdirSync('./server/assets').forEach(function (item) {
        fs.readFile('./server/assets/'+item+'/component.json', 'utf-8', function (err, data) {
            Component.create({
                name: item,
                description: JSON.parse(data).description
            });
        });
    });
});
