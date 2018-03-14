const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const frameSchema = new Schema({
  frameUri: String,
  mediaId: String,
  createdTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Frame', frameSchema);
