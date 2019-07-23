const { db } = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');

firebase.initializeApp(config);

const { validationResult } = require('express-validator');

exports.signup = async (req, res) => {
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
};

exports.login = async (req, res) => {
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
};
