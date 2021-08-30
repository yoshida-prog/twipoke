import { firestoreDB } from '../config/firestore_config';

export const docAdd = async (followerNum, userID, followerDatas) => {
    const indexNum = 'follower' + followerNum;
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