let passport = require('passport');

export const twitterAuthController = (req, res) => {
    const userID = passport.session.id;
    const twitter_token = passport.session.twitter_token;
    const twitter_token_secret = passport.session.twitter_token_secret;
    const redirectURL = '/home';
    res.cookie('userID', userID, {maxAge:6000000, httpOnly:true});
    res.cookie('tokenKey', twitter_token, {maxAge:6000000, httpOnly:true});
    res.cookie('tokenSecret', twitter_token_secret, {maxAge:6000000, httpOnly:true});
    res.redirect(redirectURL);
};