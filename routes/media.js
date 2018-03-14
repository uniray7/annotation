var express = require('express');
var router = express.Router();

var mediaHandlers = require("../controllers/mediaController.js");

// route for uploading media
router.post('/', mediaHandlers.upload);
router.post('/query', mediaHandlers.query);
router.get('/:mediaId', mediaHandlers.getMedia);
router.get('/:mediaId/frames', mediaHandlers.getFrames);

module.exports = router;
