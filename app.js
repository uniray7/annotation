const utils = require('./utils/utils.js');
// check env "ANNOTATION_ROOT" and "ANNOTATION_ENV" are existed
if (!utils.checkEnv()) {
  console.log('Please set environment variables "ANNOTATION_ROOT"');
  process.exit(-1);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const httpLogger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird')

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

const usersRoute = require('./routes/users');
const mediaRoute = require('./routes/media');
const frameRoute = require('./routes/frame');
const storeRoute = require('./routes/store');
const projRoute = require('./routes/project.js');

// get config and connect to mongodb
const config = utils.getConfig();
const dbCfg = config.services.database;

let dbOption = {}
if (dbCfg.user) {
  dbOption.auth = {user: dbCfg.user, password: dbCfg.password};
}
mongoose.connect('mongodb://'+dbCfg.host+':'+dbCfg.port+'/'+dbCfg.name, dbOption)
  .then(() =>  console.log('mongodb connection successful'))
  .catch((err) => {
    console.log(err);
    process.exit(-1);
  });

app.use(cors());
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
app.use('/api/media', mediaRoute);
app.use('/api/frames', frameRoute);
app.use('/api/projects', projRoute);
app.use('/store', storeRoute);

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

if (require.main === module) {
  app.listen(config.services.api.port);
}

module.exports = app;
