'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SongSchema = new Schema({
  name: String,
  data: Buffer
});

module.exports = mongoose.model('Song', SongSchema);
