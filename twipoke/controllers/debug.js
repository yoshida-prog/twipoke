import { firestoreDB } from '../config/firestore_config';

export const debugController = async (req, res) => {

    const userID = '1249786122';
    const roomID = 100001;
    
    const followerObj = {};
    const followers = ['follower0', 'follower2', 'follower4'];
    const userRef = await firestoreDB.db.collection('Users').doc(userID);
    const followersRef = await userRef.collection('followers');
    const userDoc = await userRef.get();
    const twitterName = userDoc.data().twitterName;
    const rate = userDoc.data().rate;
    for (const follower of followers) {
        const doc = await followersRef.doc(follower).get();
        followerObj[follower] = doc.data();
    }
    res.render('debug', {
        twitterName,
        followerObj,
        followers,
        rate,
        roomID
    });
    
  };