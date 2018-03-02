const mongoose = require('mongoose');
const  Schema = mongoose.Schema;

var mediaSchema = new Schema({
  mediaPath: String,
//TODO:  thumbnailPath: String,
  report: String,
  originalName: String,
  created: {type: Date, default: Date.now} 
});

module.exports = mongoose.model('Media', mediaSchema);
