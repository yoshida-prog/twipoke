var twitter = require('twitter');
var twitterConfig = require('../config/twitter_config');
var firestoreDB = require('../config/firestore_config');

module.exports = (req, res, next) => {

    // twitterAPI設定-----------------------------------------------------
    var client = new twitter({
        consumer_key: twitterConfig.consumer_key,
        consumer_secret: twitterConfig.consumer_secret,
        access_token_key: req.cookies.tokenKey,
        access_token_secret: req.cookies.tokenSecret
    });
    const userID = req.cookies.userID;
    //--------------------------------------------------------------------

    // ログインユーザーのTwitterIDを取得---------------------------------------
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

    // フォロワーのTwitterIDをランダムに6つ取得----------------------------------
    // その後、それぞれのフォロワーの最新4つのツイートを取得-------------------------
    user.then((value) => {
        const params = { screen_name: value.twitterID };
        const followers = new Promise ((resolve, reject) => {
            client.get('followers/list', params, (error, profiles, response) => {
                if (!error) {
                    const followersID = [];
                    const profile = profiles['users'];
                    profile.forEach((obj) => {
                        followersID.push(obj.screen_name);
                    });
                    for (var i = followersID.length; 1 < i; i--) {
                        const j = Math.floor(Math.random() * i);
                        [followersID[j], followersID[i - 1]] = [followersID[i -1], followersID[j]];
                    };
                    const sixFollowersID = followersID.slice(0, 6);
                    resolve(sixFollowersID);
                } else {
                    res.redirect('/');
                }
            });
        });
        followers.then(async (value) => {
            for (const screen_name of value) {
                var count = 0;
                const followerDatas = [];
                const params = { screen_name, count: 4 };
                const tweets = await client.get('statuses/user_timeline', params);
                tweets.forEach(obj => {
                    followerDatas.push(obj.text);
                    if (count === 3) {
                        const info = {
                            name: obj.user.name,
                            image: obj.user.profile_image_url,
                            twitterID: obj.user.screen_name
                        }
                        followerDatas.push(info);
                    }
                    count++;
                });
            }
        });
    });
    //----------------------------------------------------------------------

    res.render('matchPreparation');

}