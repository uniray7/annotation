const HttpStatus = require('http-status-codes'); 
const path = require('path');
const fs = require('fs');
const utils = require('../utils/utils.js');
const config = utils.getConfig();
// TODO(Ray): getting file needs ACL??

const storeController = {};
// get a single file, like a media, a frame

storeController.getMediaFile = function(req, res) {
  absFilePath = path.join(config.services.mediaStorage.dest, req.params.filename);
  if (fs.existsSync(absFilePath)) {
    res.sendFile(absFilePath);
  }
  else {
    res.status(HttpStatus.NOT_FOUND);
    res.send({status: HttpStatus.NOT_FOUND});
  }
};

storeController.getFrameFile = function(req, res) {
  absFilePath = path.join(config.services.frameStorage.dest, req.params.filedir, req.params.filename);
  if (fs.existsSync(absFilePath)) {
    res.sendFile(absFilePath);
  }
  else {
    res.status(HttpStatus.NOT_FOUND);
    res.send({status: HttpStatus.NOT_FOUND});
  }
};
module.exports = storeController;
