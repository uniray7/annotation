const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var mediaSchema = new Schema({
  mediaUri: String,
//TODO: thumbnailPath: String,
//TODO: ownerId: String,
  name: {type: String, required: true},
  description: String,
  report: String,
  createdTime: {type: Date, default: Date.now},
  frameNum: Number,
  status: String,
  refProject: Array
});

module.exports = mongoose.model('Media', mediaSchema);
