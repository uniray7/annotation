const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var frameSchema = new Schema({
  framePath: String,
  mediaId: String,
  created: {type: Date, default: Date.now} 
});

module.exports = mongoose.model('Frame', frameSchema);
