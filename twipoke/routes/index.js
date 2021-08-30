import express from 'express';
import passport from 'passport';
import { indexController } from '../controllers/indexController';
import { twitterAuthController } from '../controllers/twitterAuth';
import { loginController } from '../controllers/login';
import { userInfoController } from '../controllers/userInfo';
import { searchController } from '../controllers/search';
import { createStatusController } from '../controllers/createStatus';
import { matchPreparationController } from '../controllers/matchPreparation';
import { matchRoomController } from '../controllers/matchRoom';
import { matchResultController } from '../controllers/matchResult';

const router = express.Router();

router.get('/', indexController);

// twitter login OAuth------------------
router.post('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/login', failureRedirect: '/' }));
router.get('/login', twitterAuthController);
router.get('/home', loginController);
router.post('/home', matchResultController);
// -------------------------------------

router.get('/room/:id', userInfoController);
router.get('/search', searchController);
router.get('/createStatus/:id', createStatusController);
router.get('/matchPreparation/:id', matchPreparationController);
router.get('/matchRoom/:id', matchRoomController);

export const indexRouter = router;
