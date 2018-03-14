const mongoose = require("mongoose");
const passport = require("passport");
const HttpStatus = require('http-status-codes'); 
const User = require("../models/User");

const userController = {};
// Post registration
userController.register = function(req, res) {
  User.register(new User({ username : req.body.username, name: req.body.name }), req.body.password, function(err, user) {
    if (err) {
      res.status(HttpStatus.CONFLICT);
      return res.send({error: err});
    }
    passport.authenticate('local')(req, res, function () {
      return res.send();
    });
  });
};

// Post login
userController.login = function(req, res) {
  passport.authenticate('local')(req, res, function () {
    //res.redirect('/');
  });
};

// logout
userController.logout = function(req, res) {
console.log('logout')
  req.logout();
  res.send();
};

module.exports = userController;
