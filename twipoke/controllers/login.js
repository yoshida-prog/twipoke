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
    
    // ログインしたユーザーのフォロワーのtwitterIDを取得後、各フォロワーのツイートを取得
    // user.then((value) => {
    //     const loginUserParams = { user_id: value.twitterID, count: 10 };
    //     const followerParams = [];
    //     const followerTL = [];
    //     const followers = new Promise ( (resolve, reject) => {
    //         client.get('followers/list', loginUserParams, (error, followers, response) => {
    //             if (!error) {
    //                 const followersArray = followers.users;
    //                 followersArray.forEach( (follower) => {
    //                     const screenName = '@' + follower.screen_name;
    //                     followerParams.push(screenName);
    //                 });
    //                 resolve(followerParams);
    //             } else {
    //                 res.redirect('/');
    //             }
    //         });
    //     });
    //     followers.then(async (value) => {
    //         for (const element of value) {
    //             const params = { screen_name: element, count: 1};
    //             const tweets = await client.get('statuses/user_timeline', params);
    //             const tweet = tweets[0].text;
    //             console.log(tweet);
    //             console.log('----------');
    //         }
    //     });
    // });
    // --------------------------------------------------------------------

    // ログインしたことがあればtwitterNameとtwitterIDを更新
    // なければデータを新規登録------------------------------------------------
    const docSearch = async () => {
        const userRef = await firestoreDB.db.collection('Users').doc(userID);
        const doc = await userRef.get();
        if (!doc.exists) {
            user.then(async (value) => {
                await userRef.set({
                    twitterName: value.twitterName,
                    twitterID: value.twitterID,
                    profileImage: value.profileImage,
                    rate: 1000,
                    win: 0,
                    lose: 0
                });
            });
        } else {
            user.then(async (value) => {
                await userRef.update({
                    twitterName: value.twitterName,
                    twitterID: value.twitterID,
                    profileImage: value.profileImage
                });
            });
        }
    };
    docSearch();
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
        res.render('home', {
            userID,
            twitterName,
            twitterID,
            profileImage,
            rate,
            win,
            lose
        });
    });
    // --------------------------------------------------------------------
}