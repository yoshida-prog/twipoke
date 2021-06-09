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
router.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/home', failureRedirect: '/' }));
router.get('/home', loginController);
// -------------------------------------

// GET battle room create page
router.get('/room/:id', userInfoController);

router.get('/search', (req, res) => {
  res.render('search');
});

router.get('/matchPreparation/:id', matchPreparationController);

module.exports = router;
