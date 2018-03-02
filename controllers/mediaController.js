const HttpStatus = require('http-status-codes'); 
const multer  = require('multer');
const path  = require('path');
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const mediaColl = mongoose.connection.collection('media');
const mediaModel = require('../models/Media.js');

const utils = require('../utils/utils.js');
const config = utils.getConfig();
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(config.services.mediaStorage.dest, 'media'))
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
    let mediaInst = new mediaModel({
      _id: mediaId,
      mediaPath: req.file.filename,
      report: req.body.report,
      originalName: req.file.originalname
    })
    mediaInst.save().
      then((result) => {
        // TODO: logger: console.log('success insert media into mongodb');
        res.status(HttpStatus.OK);
        res.send({result: {}});
      }).
      catch((err) => {
        // TODO: logger
      });
  });

};

module.exports = mediaHandlers;
