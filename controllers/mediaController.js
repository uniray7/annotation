const HttpStatus = require('http-status-codes'); 
const multer  = require('multer');
const path  = require('path');
const isArray = require('lodash/isArray');
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
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

const mediaHandlers = {};

// get frames of mediaId
mediaHandlers.getFrames = function(req, res){
  let mediaId = req.params.mediaId;
  // TODO: mediaId not found error handle

  frameModel.find({mediaId: mediaId})
    .then((docList) => {
      return res.status(HttpStatus.OK).send(docList);
    });
}


// get metadata of mediaId
mediaHandlers.getMedia = function(req, res){
  let mediaId = req.params.mediaId;
  // check mediaId existed
  mediaModel.count({_id: mediaId})
    .then((num) => {
      if (num < 1) {
        return res.status(HttpStatus.NOT_FOUND).send({msg: 'mediaId not existed'});
      }

      return res.status(HttpStatus.OK).send(doc);
    })
    .catch((err) => {
      // TODO: logger
      console.log(err)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return res.send();
    });
}

mediaHandlers.query = function(req, res){
  let query = {};
  let body = req.body;
  if (body.mediaIds && isArray(body.mediaIds)) {
    query._id = {'$in': body.mediaIds};
  }
  mediaModel.find(query)
    .then((docList) => {
      res.status(HttpStatus.OK);
      let resList = docList.map((item) => {
        item.refProject = undefined;
        return item;
      });
      return res.send(resList);
    })
    .catch((err) => {
      // TODO: logger
      console.log(err)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return res.send();
    });

}

// upload media
mediaHandlers.upload = function(req, res) {
  let mediaId = new ObjectID();
  req.mediaId = mediaId;
  let upload = uploader.single('media');
  upload(req, res, (err) => {
    if (err) {
      // TODO: logger
      console.log(err)
      res.status(HttpStatus.BAD_REQUEST);
      return res.send();
    }
    if (!req.file || !req.body.name) {
      // TODO: logger
      console.log(new Error('wrong property of request'))
      res.status(HttpStatus.BAD_REQUEST);
      return res.send();
    }

    let mediaMeta = new mediaModel({
      _id: mediaId,
      name: req.body.name,
      description: req.body.description,
      mediaUri: path.join('store', 'media', req.file.filename),
      report: req.body.report,
      frameNum: 0,
      status: 'processing',
      refProject: []
    });

    mediaMeta.save()
      .then((result) => {
        // TODO: logger: console.log('success insert metadata of media into mongodb');
        let videoSrc = path.join(config.services.mediaStorage.dest, req.file.filename);
        let frameDir = config.services.frameStorage.dest;
        res.status(HttpStatus.OK);
        res.send({mediaId: mediaId});
        // start extract frame from saved video
        return extractFrame(mediaId, videoSrc, frameDir, 1);
      })
      .then((extractFrameResults) => {
        // save metadata of each extracted frames into mongodb
        let result = extractFrameResults[0]
        let mediaId = result.mediaId
        let insertArr = [];
        for (idx in result.filenames) {
          filename = result.filenames[idx]
          insertArr.push({
            _id: new ObjectID(),
            frameUri: path.join('store', 'frame', mediaId, filename),
            mediaId: mediaId
          })
        }
        return frameModel.insertMany(insertArr);
      })
      .then((docs) => {
        // update status of media
        return mediaModel.update({_id: mediaId}, {$set: {status: 'done', frameNum: docs.length}});
      })
      .catch((err) => {
        // TODO: logger
        console.log(err)
        switch (err.name) {
          case 'ValidationError':
            res.status(HttpStatus.BAD_REQUEST);
            return res.send();
          default:
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            return res.send();
        }
      });
  });

};

module.exports = mediaHandlers;
