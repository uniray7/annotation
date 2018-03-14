var express = require('express');
var router = express.Router();

var frameHandlers = require("../controllers/frameController.js");

// query frames
//router.post('/query', frameHandlers.queryFrames);

// get frames by mediaId
router.get('/', frameHandlers.getFrames);
module.exports = router;
