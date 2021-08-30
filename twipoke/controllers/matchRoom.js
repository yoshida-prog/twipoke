import { firestoreDB } from '../config/firestore_config';

export const matchRoomController = async (req, res) => {

    const userID = req.cookies.userID;
    const roomID = req.params.id;
    
    const followerObj = {};
    const followers = Object.keys(req.query);
    const userRef = await firestoreDB.db.collection('Users').doc(userID);
    const followersRef = await userRef.collection('followers');
    const userDoc = await userRef.get();
    const twitterName = userDoc.data().twitterName;
    const rate = userDoc.data().rate;
    for (const follower of followers) {
        const doc = await followersRef.doc(follower).get();
        followerObj[follower] = doc.data();
    }
    res.render('matchRoom', {
        roomID,
        followerObj,
        followers,
        rate,
        twitterName
    });
    
  };