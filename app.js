const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const httpLogger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird')

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const usersRoute = require('./routes/users');

const utils = require('./utils/utils.js');

const config = utils.getConfig('./config/config.yml');
const dbConfig = config.services.database;

var app = express();
const Schema = mongoose.Schema;

let dbOption = {}
if (dbConfig.user) {
  dbOption.auth = {user: dbConfig.user, password: dbConfig.password};
}

mongoose.connect('mongodb://'+dbConfig.host+':'+dbConfig.port+'/'+dbConfig.name, dbOption)
  .then(() =>  console.log('mongodb connection successful'))
  .catch((err) => {
    console.log(err);
    process.exit(-1);
  });

app.use(require('express-session')({
  name: 'jagerAnnotation',
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

var User = require('./models/User');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(httpLogger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/users', usersRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json(err);
});

app.listen(6000)
module.exports = app;
