const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var projSchema = new Schema({
  name: {type: String, required: true},
  type: {type: String, required: true},
  description: String,
  createdTime: {type: Date, default: Date.now},
  labels: {type: Array, required: true},
  annotators: Array,
  mediaIds: Array
});

module.exports = mongoose.model('Project', projSchema);
