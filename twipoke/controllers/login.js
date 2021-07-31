let twitter = require('twitter');
import twitterConfig from '../config/twitter_config';
import { firestoreDB } from '../config/firestore_config';

export const loginController = (req, res, next) => {

    // twitterAPI設定----------------------------------------------
    let client = new twitter({
        consumer_key: twitterConfig.consumer_key,
        consumer_secret: twitterConfig.consumer_secret,
        access_token_key: req.cookies.tokenKey,
        access_token_secret: req.cookies.tokenSecret
    });
    const userID = req.cookies.userID;
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