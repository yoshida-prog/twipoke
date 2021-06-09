var twitter = require('twitter');
var passport = require('passport');
var twitterConfig = require('../config/twitter_config');
var firestoreDB = require('../config/firestore_config');

module.exports = (req, res, next) => {

    // twitterAPI設定-----------------------------------------------------
    var client = new twitter({
        consumer_key: twitterConfig.consumer_key,
        consumer_secret: twitterConfig.consumer_secret,
        access_token_key: passport.session.twitter_token,
        access_token_secret: passport.session.twitter_token_secret
    });
    const userID = passport.session.id;
    //--------------------------------------------------------------------

    // ログインユーザーのTwitterIDを取得---------------------
    const user = new Promise (function(resolve, reject) {
        client.get('statuses/user_timeline', { count: 1 }, (error, tweets, response) => {
            if (!error) { 
                resolve({
                    twitterID: '@' + tweets[0].user.screen_name
                });
            } else {
                res.redirect('/');
            }
        });
    });
    //---------------------------------------------------------------------

    user.then((value) => {
        const params = { screen_name: value.twitterID };
        client.get('followers/list', params, (error, profiles, response) => {
            if (!error) {
                console.log(profiles);
            }
        });
    });

    res.render('matchPreparation');

}