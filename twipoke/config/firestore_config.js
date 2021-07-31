let admin = require('firebase-admin');
import serviceAccount from './serviceAccountKey';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

export const firestoreDB = {
    db: db
};