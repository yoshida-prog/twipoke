let twitter = require('twitter');
import twitterConfig from '../config/twitter_config';
import { firestoreDB } from '../config/firestore_config';

export const userInfoController = (req, res, next) => {

    // twitterAPI設定-----------------------------------------------------
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

    // 対戦部屋画面で使うパラメータを取得--------------------------------------
    user.then(async (value) => {
        const doc = await firestoreDB.db.collection('Users').doc(userID).get();
        const twitterName = doc.data().twitterName;
        const twitterID = doc.data().twitterID;
        const profileImage = doc.data().profileImage;
        const rate = doc.data().rate;
        const win = doc.data().win;
        const lose = doc.data().lose;
        const roomID = req.params.id;
        const referer = req.headers.referer;
        const refererArray = referer.split('/');
        const refererPath = refererArray[refererArray.length - 1];
        let isCameSearchID = false;
        if (refererPath === 'search?') {
            isCameSearchID = true;
        }
        res.render('room', {
            twitterName,
            twitterID,
            profileImage,
            rate,
            win,
            lose,
            roomID,
            referer,
            isCameSearchID
        });
    });
    // --------------------------------------------------------------------
}