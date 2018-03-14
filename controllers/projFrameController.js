const HttpStatus = require('http-status-codes');
const createError = require('http-errors');
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const every = require('lodash/every');
const isNumber = require('lodash/isNumber');
const isArray = require('lodash/isArray');
const includes = require('lodash/includes');

const projModel = require('../models/Project.js');
const projFrameModel = require('../models/ProjFrame.js');

const projFrameHandlers = {};

projFrameHandlers.getFrame = function(req, res, next) {
  let projectId = req.params.projectId;
  projFrameModel.findOne({projectId: projectId, status: 'unlabeled'}, {}, {sort: {lastGetTime: 1}})
    .then((projFrameDoc) => {
      if (!projFrameDoc) {
        return res.status(HttpStatus.NO_CONTENT).send();
      }

      res.status(HttpStatus.OK).send(projFrameDoc);
      return projFrameModel.update({_id: projFrameDoc.id}, {lastGetTime: Date.now()});  
    })
    .catch((err) => {
      console.log(err);
      return next(new createError.InternalServerError());
    });
}

projFrameHandlers.queryProjFrames = function(req, res, next) {
  let projectId = req.params.projectId;
  let body = req.body;
  let query = {};
  query.projectId = projectId;
  allowedStatus = ['unlabeled', 'labeled', 'verified', 'rejected'];

  if (body.status) {
    if ( !includes(allowedStatus, body.status) )
    {return res.status(HttpStatus.BAD_REQUEST).send();}
    query.status = body.status;
  }
  projFrameModel.find(query)
    .then((docList) => {
      if (!docList) {
        return res.status(HttpStatus.NO_CONTENT).send();
      }
      return res.status(HttpStatus.OK).send(docList);
    })
    .catch((err) => {
      console.log(err);
      return next(new createError.InternalServerError());
    });
}

projFrameHandlers.postLabels = function(req, res, next) {
  let projectId = req.params.projectId;
  let projFrameId = req.params.projFrameId;
  let labels = req.body.labels;
  // TODO: get allowed label which is defined in project
  // check the body
  if(!labels || !isArray(labels)) {
    return next(new createError.BadRequest());
  }

  return projModel.findOne({_id: projectId})
    .then((projMeta) => {
      if( !projMeta ) {
        return res.status(HttpStatus.NOT_FOUND).send({msg: 'projectId not found'});
      }
      let allowedLabels = projMeta.labels;
      let isValidate = every(labels, (label) => {
        if ( !includes(allowedLabels, label.label) ) {
          return false;
        }
        let bbox = label.bbox;

        if ( !(bbox.length === 4) || !isNumber(bbox[0]) || !isNumber(bbox[1]) || 
              !isNumber(bbox[2]) || !isNumber(bbox[3])) {
          return false; 
        } 
        return true;
      });
      if ( !isValidate ) {
        // TODO: logger
        return res.status(HttpStatus.BAD_REQUEST).send();
      }
      console.log(projFrameId)
      console.log(labels)
      return projFrameModel.update({_id: projFrameId}, {$set: {status: 'labeled', labels: labels}});
    })
    .then((result) => {
      return res.status(HttpStatus.OK).send();
    })
    .catch((err) => {
        console.log(err);
        console.log(typeof(err));

        return res.status(HttpStatus.NOT_FOUND).send({msg: 'frameId not found'});
    
    });
}
module.exports = projFrameHandlers;
