const functions = require('firebase-functions');

const { check } = require('express-validator');

const express = require('express');
const app = express();

const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream
} = require('./handlers/scream');
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require('./handlers/user');

const FBAuth = require('./util/fbAuth');

// Scream route
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
app.delete('/scream/:screamId', FBAuth, deleteScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
// TODO delete scream
// TODO like a scream
// TODO unlike a scream
// TODO comment on scream

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

app.post('/user/image', FBAuth, uploadImage);

app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);
// exports.api = functions.region('europe-west1').https.onRequest(app);