'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ComponentSchema = new Schema({
  fullName: String,
  name: String,
  description: String,
  file: String,
  dataType: String,
  active: Boolean,
  takesUniform: Boolean
});

module.exports = mongoose.model('Component', ComponentSchema);
