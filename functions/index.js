const functions = require('firebase-functions');

const { check } = require('express-validator');

const express = require('express');
const app = express();

// const firebaseConfig = {
//   apiKey: 'AIzaSyB3h8yfxJHyP79BDSnMRy7JzxtlDgCNVqw',
//   authDomain: 'social-ape-c1875.firebaseapp.com',
//   databaseURL: 'https://social-ape-c1875.firebaseio.com',
//   projectId: 'social-ape-c1875',
//   storageBucket: 'social-ape-c1875.appspot.com',
//   messagingSenderId: '845987806178',
//   appId: '1:845987806178:web:26b480755bacc851'
// };
// firebase.initializeApp(firebaseConfig);

const { getAllScreams, postOneScream } = require('./handlers/scream');
const { signup, login } = require('./handlers/user');

const FBAuth = require('./util/fbAuth');

// Scream route
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

// Users route
app.post(
  '/signup',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required')
      .not()
      .isEmpty(),
    check('handle', 'Handle is required')
      .not()
      .isEmpty()
  ],
  signup
);

app.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required')
      .not()
      .isEmpty()
  ],
  login
);

exports.api = functions.https.onRequest(app);
// exports.api = functions.region('europe-west1').https.onRequest(app);
