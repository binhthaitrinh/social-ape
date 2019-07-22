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

app.get('/screams', (req, res) => {
  db.collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(screams);
    })
    .catch(err => console.log(err));
});

app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db.collection('screams')
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: `something went wrong` });
      console.error(err);
    });
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
  (req, res) => {
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

    db.doc(`/users/${newUser.handle}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return res
            .status(400)
            .json({ handle: 'this handle is already taken' });
        } else {
          return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
      })
      .then(data => {
        userId = data.user.uid;
        return data.user.getIdToken();
      })
      .then(idToken => {
        token = idToken;
        const userCredentials = {
          handle: newUser.handle,
          email: newUser.email,
          createdAt: new Date().toISOString(),
          userId: userId
        };
        return db.doc(`users/${newUser.handle}`).set(userCredentials);
      })
      .then(() => {
        return res.status(201).json({ token });
      })
      .catch(err => {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
          return res.status(400).json({ email: 'Email is already in use' });
        }
        return res.status(500).json({ error: err.code });
      });
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
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = {
      email: req.body.email,
      password: req.body.password
    };

    firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then(data => {
        return data.user.getIdToken();
      })
      .then(token => {
        return res.json({ token });
      })
      .catch(err => {
        console.error(err);
        if (err.code === 'auth/wrong-password') {
          return res
            .status(403)
            .json({ general: 'Wrong credentials, please try again' });
        }
        return res.status(500).json({ error: err.code });
      });
  }
);

exports.api = functions.https.onRequest(app);
// exports.api = functions.region('europe-west1').https.onRequest(app);
