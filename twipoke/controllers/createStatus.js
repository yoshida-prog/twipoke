var twitter = require('twitter');
var twitterConfig = require('../config/twitter_config');
var firestoreDB = require('../config/firestore_config');
var followerTypes = require('../config/followerTypes');
var followerStatus = require('../config/followerStatus');

module.exports = (req, res, next) => {

    const roomID = req.params.id;
    const followerStatusFunc = (statusType_max, statusType_min) => {
        const status = Math.floor(Math.random() * (statusType_max - statusType_min) + statusType_min);
        return status;
    };

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
    user.then((value) => {
        const params = { screen_name: value.twitterID, count: 20 }; //本番環境は100に変更
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
        // それぞれのフォロワーの最新4つのツイートを取得後、ステータスとツイートにわざ内容を付与
        followers.then(async (value) => {
            var i = 0;
            for (const screen_name of value) {
                const followerDatas = {};
                const params = { screen_name, count: 4 };
                const tweets = await client.get('statuses/user_timeline', params);
                tweets.forEach((obj, index, array) => {
                    const tweetIndex = 'tweet' + index;
                    if (index === 0) {
                        const randomIndex = Math.floor(Math.random() * followerTypes.length);
                        const followerType = followerTypes[randomIndex];
                        const followerTypeKey = Object.keys(followerType);
                        followerDatas.name = obj.user.name;
                        followerDatas.image = obj.user.profile_image_url;
                        followerDatas.twitterID = obj.user.screen_name;
                        followerDatas.followerType = followerTypeKey[0];
                        followerDatas.hp = followerStatusFunc(followerStatus.hp_max, followerStatus.hp_min);
                        followerDatas.attack = followerStatusFunc(followerStatus.attack_max, followerStatus.attack_min);
                        followerDatas.defense = followerStatusFunc(followerStatus.defense_max, followerStatus.defense_min);
                        followerDatas.speed = followerStatusFunc(followerStatus.speed_max, followerStatus.speed_min);
                        followerDatas[tweetIndex] = {
                            type: followerTypeKey[0],
                            attack: followerStatusFunc(followerStatus.skillAttack_max, followerStatus.skillAttack_min),
                            accuracy: followerStatusFunc(followerStatus.skillAccuracy_max, followerStatus.skillAttack_min),
                            tweet: obj.text
                        };
                    } else if (index === 1) {
                        followerDatas[tweetIndex] = {
                            type: followerDatas.followerType,
                            attack: followerStatusFunc(followerStatus.skillAttack_max, followerStatus.skillAttack_min),
                            accuracy: followerStatusFunc(followerStatus.skillAccuracy_max, followerStatus.skillAttack_min),
                            tweet: obj.text
                        };
                    } else {
                        followerDatas[tweetIndex] = {
                            type: 'normal',
                            attack: followerStatusFunc(followerStatus.skillAttack_max, followerStatus.skillAttack_min),
                            accuracy: followerStatusFunc(followerStatus.skillAccuracy_max, followerStatus.skillAttack_min),
                            tweet: obj.text
                        };
                    }
                });
                // firestoreにfollowerDatasの内容を保存
                const docAdd = async () => {
                    const indexNum = 'follower' + i;
                    const followersDoc = await firestoreDB.db.collection('Users').doc(userID).collection('followers').doc(indexNum);
                    await followersDoc.set({
                        name: followerDatas.name,
                        image: followerDatas.image,
                        followerType: followerDatas.followerType,
                        hp: followerDatas.hp,
                        attack: followerDatas.attack,
                        defense: followerDatas.defense,
                        speed: followerDatas.speed,
                        tweet0: followerDatas.tweet0,
                        tweet1: followerDatas.tweet1,
                        tweet2: followerDatas.tweet2,
                        tweet3: followerDatas.tweet3
                    });
                };
                docAdd();
                i++;
            }
            res.redirect('/matchPreparation/' + roomID);
        });
    });
    //----------------------------------------------------------------------

}