var express = require('express');
var router = express.Router();
var passport = require('passport');
var firestoreDB = require('../config/firestore_config');
var loginController = require('../controllers/login');
var userInfoController = require('../controllers/userInfo');
var createStatusController = require('../controllers/createStatus');
var matchPreparationController = require('../controllers/matchPreparation');
var matchRoomController = require('../controllers/matchRoom');
var debugController = require('../controllers/debug');
var matchResultController = require('../controllers/matchResult');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

// twitter login OAuth------------------
router.post('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/login', failureRedirect: '/' }));
router.get('/login', (req, res) => {
  const userID = passport.session.id;
  const twitter_token = passport.session.twitter_token;
  const twitter_token_secret = passport.session.twitter_token_secret;
  const redirectURL = '/home';
  res.cookie('userID', userID, {maxAge:6000000, httpOnly:true});
  res.cookie('tokenKey', twitter_token, {maxAge:6000000, httpOnly:true});
  res.cookie('tokenSecret', twitter_token_secret, {maxAge:6000000, httpOnly:true});
  res.redirect(redirectURL);
});
router.get('/home', loginController);
router.post('/home', matchResultController);
// -------------------------------------

// GET battle room create page
router.get('/room/:id', userInfoController);

router.get('/search', (req, res) => {
  res.render('search');
});

router.get('/createStatus/:id', createStatusController);
router.get('/matchPreparation/:id', matchPreparationController);
router.get('/matchRoom/:id', matchRoomController);

router.get('/debug', debugController);

module.exports = router;
