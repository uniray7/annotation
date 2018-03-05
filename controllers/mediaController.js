const HttpStatus = require('http-status-codes'); 
const multer  = require('multer');
const path  = require('path');
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const mediaColl = mongoose.connection.collection('media');
const mediaModel = require('../models/Media.js');
const frameModel = require('../models/Frame.js');

const extractFrame = require('../3rdparty/extractFrame.js');
const utils = require('../utils/utils.js');
const config = utils.getConfig();
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(config.services.mediaStorage.dest))
  },
  filename: (req, file, cb) => {
    let mediaId = req.mediaId;
    let oriName = file.originalname;
    let ext = oriName.substring(oriName.lastIndexOf('.') + 1);
    cb(null, mediaId+'.'+ext);
  }
});

// TODO: need fileFilter: https://ninghao.net/blog/5131
const uploader = multer({ 
  storage: mediaStorage
});

var mediaHandlers = {};

// upload media
mediaHandlers.upload = function(req, res) {
  let mediaId = new ObjectID();
  req.mediaId = mediaId;
  let upload = uploader.single('media');
  upload(req, res, (err) => {
    if (err) {// TODO
      console.log(err)
    }
    let mediaMeta = new mediaModel({
      _id: mediaId,
      mediaPath: req.file.filename,
      report: req.body.report,
      originalName: req.file.originalname
    })

    mediaMeta.save().
      then((result) => {
        // TODO: logger: console.log('success insert metadata of media into mongodb');
        let videoSrc = path.join(config.services.mediaStorage.dest, result.mediaPath);
        let frameDir = config.services.frameStorage.dest;
        res.status(HttpStatus.OK);
        res.send({result: {}});
        // start extract frame from saved video
        return extractFrame(mediaId, videoSrc, frameDir, 1);
      }).
      then((extractFrameResults) => {
        // save metadata of each extracted frames into mongodb
        let result = extractFrameResults[0]
        let mediaId = result.mediaId
        let insertArr = [];
        for (idx in result.filenames) {
          filename = result.filenames[idx]
          insertArr.push({
            _id: new ObjectID(),
            framePath: path.join(mediaId, filename),
            mediaId: mediaId
          })
        }
        return frameModel.insertMany(insertArr);
      }).
      catch((err) => {
        console.log(err)
        // TODO: logger
      });
  });

};

module.exports = mediaHandlers;
