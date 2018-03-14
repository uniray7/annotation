const HttpStatus = require('http-status-codes');
const createError = require('http-errors');
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const frameModel = require('../models/Frame.js');

const frameHandlers = {};


frameHandlers.getFrames = function(req, res, next) {
  if ( !req.query || !req.query.mediaId || !(typeof(req.query.mediaId)=='string')) {
    return next(new createError.BadRequest());
  }

  frameModel.find({mediaId: req.query.mediaId})
    .exec((err, list) => {
      if (err) {return next(new createError.InternalServerError());}
      res.status(HttpStatus.OK);
      return res.send(list); 
    })
}

/* deprecated
frameHandlers.queryFrames = function(req, res, next) {
  let query = {};
  let body = req.body;
  try {
    if (!body['createdTime'] || !body['createdTime']['start'] || !body['createdTime']['end']) {
      return next(new createError.BadRequest());
    }
    if ((typeof body['createdTime']['start'] !== 'number') || (typeof body['createdTime']['end'] !== 'number')) {
      return next(new createError.BadRequest());
    }

    let startTime = new Date(body['createdTime']['start']*1000);
    let endTime = new Date(body['createdTime']['end']*1000);
    query['createdTime'] = {$gte: startTime, $lt: endTime};

    if (body['mediaId']) {
      if (!Array.isArray(body['mediaId'])) { return next(new createError.BadRequest()); }
      query['mediaId'] = {'$in': body['mediaId']};
    }
    frameModel.find(query)
      .exec( (err,  list) => {
        if (err) {return next(new createError.InternalServerError());}
        res.status(HttpStatus.OK);
        return res.send(list);
      });

  } catch(err) {
    //TODO: logger
    console.log(err);
    return next(new createError.InternalServerError());
  }
};
*/

module.exports = frameHandlers;
