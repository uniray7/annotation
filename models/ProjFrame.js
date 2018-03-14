const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projFrameSchema = new Schema({
  oriFrameId: {type: String, required: true},
  mediaId: {type: String, required: true},
  projectId: {type: String, required: true},
  frameUri: {type: String, required: true},
  status: {type: String, required: true},
  lastGetTime: {type: Date, default: Date.now},
  labels: {type: Array},
  annotator: String,
  comment: String
});

module.exports = mongoose.model('ProjFrame', projFrameSchema);
