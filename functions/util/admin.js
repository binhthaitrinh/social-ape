var admin = require('firebase-admin');
var serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://social-ape-c1875.firebaseio.com',
  storageBucket: 'social-ape-c1875.appspot.com'
});

const db = admin.firestore();

module.exports = { admin, db };
