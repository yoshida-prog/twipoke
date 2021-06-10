var express = require('express');
var router = express.Router();
var passport = require('passport');
var loginController = require('../controllers/login');
var userInfoController = require('../controllers/userInfo');
var matchPreparationController = require('../controllers/matchPreparation');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

// twitter login OAuth------------------
router.post('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/login', failureRedirect: '/' }));
router.get('/login', (req, res) => {
  const userID = passport.session.id;
  const redirectURL = '/home/' + userID;
  res.cookie('userID', userID, {maxAge:6000000, httpOnly:false});
  res.cookie('tokenKey', passport.session.twitter_token, {maxAge:6000000, httpOnly:false});
  res.cookie('tokenSecret', passport.session.twitter_token_secret, {maxAge:6000000, httpOnly:false});
  res.redirect(redirectURL);
});
router.get('/home/:id', loginController);
// -------------------------------------

// GET battle room create page
router.get('/room/:id', userInfoController);

router.get('/search', (req, res) => {
  res.render('search');
});

router.get('/matchPreparation/:id', matchPreparationController);

module.exports = router;
