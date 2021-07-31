let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let bodyParser = require('body-parser');
import twitterConfig from './config/twitter_config';
import { indexRouter } from './routes/index';

// TwitterAPI設定-----------------------
let passport = require('passport');
let session = require('express-session');
let TwitterStrategy = require('passport-twitter').Strategy;
let TWITTER_CONSUMER_KEY = twitterConfig.consumer_key;
let TWITTER_CONSUMER_SECRET = twitterConfig.consumer_secret;
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://localhost:3000/auth/twitter/callback" //本番環境はここを変える
}, function (token, tokenSecret, profile, done) {
    passport.session.id = profile.id;
    passport.session.twitter_token = token;
    passport.session.twitter_token_secret = tokenSecret;
    profile.twitter_token = token;
    profile.twitter_token_secret = tokenSecret;
    process.nextTick(() => {
      return done(null, profile);
    });
}));
//---------------------------------------

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/socket.io/client-dist')));
app.use(bodyParser.urlencoded({extended: false}));
// --------------------------
app.use(passport.initialize());
app.use(passport.session());
app.use(session({secret: 'secret'}));
// --------------------------

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
