var express = require('express');
var router = express.Router();

var mediaHandlers = require("../controllers/mediaController.js");

// route for uploading media
router.post('/', mediaHandlers.upload);

module.exports = router;
