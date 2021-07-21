var firestoreDB = require('../config/firestore_config');

module.exports = async (req, res, next) => {

    const userID = req.cookies.userID;
    const doc = await firestoreDB.db.collection('Users').doc(userID).get();

    // ログイン後画面で使うパラメータを取得--------------------------------------
    const twitterName = await doc.data().twitterName;
    const twitterID = await doc.data().twitterID;
    const profileImage = await doc.data().profileImage;
    const rate = await doc.data().rate;
    const win = await doc.data().win;
    const lose = await doc.data().lose;
    res.render('home', {
        userID,
        twitterName,
        twitterID,
        profileImage,
        rate,
        win,
        lose
    });
    // --------------------------------------------------------------------
}