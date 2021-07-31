import { firestoreDB } from '../config/firestore_config';

export const matchPreparationController = async (req, res, next) => {

    const userID = req.cookies.userID;
    const followersStatus = {};
    const followersType = [];
    const userRef = await firestoreDB.db.collection('Users').doc(userID);
    const followersRef = await userRef.collection('followers');
    const snapshot = await followersRef.get();
    snapshot.forEach(doc => {
        followersStatus[doc.id] = (doc.data());
    });
    snapshot.forEach(doc => {
        followersType.push(doc.data().followerType);
    });
    res.render('matchPreparation', {
        followersStatus,
        followersType
    });

};