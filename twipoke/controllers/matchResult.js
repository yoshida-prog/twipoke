import { firestoreDB } from '../config/firestore_config';

export const matchResultController = async (req, res, next) => {

    const userID = req.cookies.userID;
    const userRef = await firestoreDB.db.collection('Users').doc(userID);
    const doc = await firestoreDB.db.collection('Users').doc(userID).get();
    await userRef.update({  
        rate: req.body.rate
    });
    if (req.body.result === 'win') {
        let win = await doc.data().win;
        win++;
        await userRef.update({
            win
        });
    } else if (req.body.result === 'lose') {
        let lose = await doc.data().lose;
        lose++;
        await userRef.update({
            lose
        });
    }

    res.redirect('/home');
}