const HttpStatus = require('http-status-codes'); 
const Promise = require('bluebird');
const path  = require('path');
const arrSub = require('array-subtract')

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projModel = require('../models/Project.js');
const mediaModel = require('../models/Media.js');
const frameModel = require('../models/Frame.js');
const projFrameModel = require('../models/ProjFrame.js');

const projHandlers = {};

projHandlers.getProj = function(req, res){
  let projectId = req.params.projectId;
  projModel.findById(projectId)
    .then((doc) => {
      doc.media = undefined
      doc.annotators = undefined
      return res.status(HttpStatus.OK).send(doc);
    })
    .catch((err) => {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });
}

projHandlers.query = function(req, res){
  return projModel.find()
    .then((docs) => {
      return res.status(HttpStatus.OK).send(docs);
    });

}

projHandlers.getMedia = function(req, res){
  let projectId = req.params.projectId;
  projModel.findById(projectId)
    .then((doc) => {
      res.status(HttpStatus.OK);
      return res.send({_id: doc._id, media: doc.media});
    })
    .catch((err) => {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return res.send();
    });
}

projHandlers.patchMedia = function(req, res){
  let projectId = req.params.projectId;
  if (!req.body.mediaIds) {
    res.status(HttpStatus.BAD_REQUEST);
    return res.send();
  }
  // TODO(Ray): check media are done
  let newMediaArr = req.body.mediaIds;
  return projModel.findById(projectId)
    .then((doc) => {
    //TODO: if projectId not existed
      let currMediaArr = doc.mediaIds;
      // compare newMediaArr with currMediaArr
      let subtractor = new arrSub((a,b) => {return a===b;})
      let addArr = subtractor.sub(newMediaArr, currMediaArr);
      let delArr = subtractor.sub(currMediaArr, newMediaArr);
      return Promise.join(addMediaAndFrame(addArr), delMediaAndFrame(delArr));
    })
    .then((result) => {
      return res.status(HttpStatus.OK).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return res.send();
    });

  function addMediaAndFrame(mediaArr) {
    if (mediaArr.length === 0) {
      return Promise.resolve([]);
    }
    // get corresponding frame and insert to projMedia model
    return frameModel.find({mediaId: {$in: mediaArr}})
      .then((frameMetas) => {
        return Promise.map(frameMetas, (frameMeta, index, length) => {
          let projFrameMeta = {
            oriFrameId: frameMeta._id,
            mediaId: frameMeta.mediaId,
            projectId: projectId,
            frameUri: frameMeta.frameUri,
            status: 'unlabeled'
          };
          return projFrameMeta;
        });
      })
      .then((projFrameMetas) => {
        return projFrameModel.insertMany(projFrameMetas);
      })
      .then((result) => {
        // push mediaArr in project meta(with projectId)
        return projModel.update({_id: projectId}, {$push: {mediaIds: mediaArr}});
      })
      .then((result) => {
        // push projectId in 'refProject' in each media
        return Promise.map(mediaArr, (mediaId, index, length) => {
          return mediaModel.update({_id: mediaId}, {$push: {refProject: projectId}});
        });
      });
  }

  function delMediaAndFrame(mediaArr) {
    if (mediaArr.length === 0) {
      return Promise.resolve([]);
    }
    // delete label meta with projectId and mediaId in mediaArr
    return projFrameModel.remove({projectId: projectId, mediaId: {$in: mediaArr}})
      .then((result) => {
        // pull mediaArr in project meta(with projectId)
        return projModel.update({_id: projectId}, {$pull: {mediaIds: {$in: mediaArr}}});
      })
      .then((result) => {
        // pull projectId in 'refProject' in each media
         return Promise.map(mediaArr, (mediaId, index, length) => {
           return mediaModel.update({_id: mediaId}, {$pull: {refProject: projectId}});
        });
      });
  }
}

projHandlers.create = function(req, res){
  let body = req.body;
  if (!body.name || !body.type, !body.labels) {
    res.status(HttpStatus.BAD_REQUEST);
    return res.send();
  }

  let projMeta = new projModel({
    name: body.name,
    type: body.type,
    labels: body.labels,
    description: body.description
  });

  return projMeta.save()
    .then((result) => {
      res.status(HttpStatus.OK);
      return res.send({projectId: result._id})
    })
    .catch((err) => {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return res.send();
    });
}
module.exports = projHandlers;
