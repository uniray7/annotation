var express = require('express');
var router = express.Router();

var storeHandlers = require("../controllers/storeController.js");

// route for get a single file
router.get('/media/:filename', storeHandlers.getMediaFile);
router.get('/frame/:filedir/:filename', storeHandlers.getFrameFile);

module.exports = router;
