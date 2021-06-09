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

    // ログインユーザーのTwitterアカウント名とTwitterIDを取得---------------------
    const user = new Promise (function(resolve, reject) {
        client.get('statuses/user_timeline', { count: 1 }, (error, tweets, response) => {
            if (!error) { 
                resolve({
                    twitterName: tweets[0].user.name,
                    twitterID: '@' + tweets[0].user.screen_name,
                    profileImage: tweets[0].user.profile_image_url
                });
            } else {
                res.redirect('/');
            }
        });
    });
    //---------------------------------------------------------------------

    // ログイン後画面で使うパラメータを取得--------------------------------------
    user.then(async (value) => {
        const doc = await firestoreDB.db.collection('Users').doc(userID).get();
        const twitterName = doc.data().twitterName;
        const twitterID = doc.data().twitterID;
        const profileImage = doc.data().profileImage;
        const rate = doc.data().rate;
        const win = doc.data().win;
        const lose = doc.data().lose;
        // roomIDを追加
        const roomID = req.params.id;
        res.render('room', {
            twitterName,
            twitterID,
            profileImage,
            rate,
            win,
            lose,
            roomID
        });
    });
    // --------------------------------------------------------------------
}