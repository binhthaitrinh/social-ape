const functions = require('firebase-functions');
var admin = require('firebase-admin');

const { check, validationResult } = require('express-validator/check');

var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://social-ape-c1875.firebaseio.com'
});

const express = require('express');
const app = express();

const firebase = require('firebase');
const firebaseConfig = {
  apiKey: 'AIzaSyB3h8yfxJHyP79BDSnMRy7JzxtlDgCNVqw',
  authDomain: 'social-ape-c1875.firebaseapp.com',
  databaseURL: 'https://social-ape-c1875.firebaseio.com',
  projectId: 'social-ape-c1875',
  storageBucket: 'social-ape-c1875.appspot.com',
  messagingSenderId: '845987806178',
  appId: '1:845987806178:web:26b480755bacc851'
};
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/screams', async (req, res) => {
  try {
    const result = await db
      .collection('screams')
      .orderBy('createdAt', 'desc')
      .get();

    let screams = [];
    result.forEach(scream => {
      screams.push({
        screamId: scream.id,
        body: scream.data().body,
        userHandle: scream.data().userHandle,
        createdAt: scream.data().createdAt
      });
    });

    return res.json(screams);
  } catch (err) {
    console.error(err);
  }
});

const FBAuth = async (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    const abc = await db
      .collection('users')
      .where('userId', '==', req.user.uid)
      .limit(1)
      .get();
    req.user.handle = abc.docs[0].data().handle;
    return next();
  } catch (err) {
    console.error(err);
    return res.status(403).json(err);
  }
};

app.post('/scream', FBAuth, async (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString()
  };
  try {
    const doc = await db.collection('screams').add(newScream);
    return res.json({ message: `document ${doc.id} created` });
  } catch (err) {
    res.status(500).json({ error: `something went wrong` });
    console.error(err);
  }
});

// Signup route
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle
    };

    // TODO: validate data

    let token, userId;

    try {
      const doc = await db.doc(`/users/${newUser.handle}`).get();
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken' });
      }

      const data = await firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password);
      userId = data.user.uid;
      token = await data.user.getIdToken();

      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId: userId
      };
      await db.doc(`users/${newUser.handle}`).set(userCredentials);
      return res.status(201).json({ token });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use' });
      }
      return res.status(500).json({ error: err.code });
    }
  }
);

app.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = {
      email: req.body.email,
      password: req.body.password
    };

    try {
      const data = await firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password);
      const token = await data.user.getIdToken();
      return res.json({ token });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        return res
          .status(403)
          .json({ general: 'Wrong credentials, please try again' });
      }
      return res.status(500).json({ error: err.code });
    }
  }
);

exports.api = functions.https.onRequest(app);
// exports.api = functions.region('europe-west1').https.onRequest(app);
