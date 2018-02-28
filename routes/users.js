var express = require('express');
var router = express.Router();

var auth = require("../controllers/authController.js");

// route for register action
router.post('/register', auth.register);

// route to login action
router.post('/login', auth.login);

// route for logout action
router.get('/logout', auth.logout);

module.exports = router;
