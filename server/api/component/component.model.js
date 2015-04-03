'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ComponentSchema = new Schema({
  name: String,
  description: String,
  active: Boolean
});

module.exports = mongoose.model('Component', ComponentSchema);
