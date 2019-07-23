const { db } = require('../util/admin');

exports.getAllScreams = async (req, res) => {
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
};

exports.postOneScream = async (req, res) => {
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
};

exports.getScream = (req, res) => {
  let screamData = {};
  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      screamData = doc.data();
      screamData.screamId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('screamId', '==', req.params.screamId)
        .get();
    })
    .then(data => {
      screamData.comments = [];
      data.forEach(doc => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// comment on scream
exports.commentOnScream = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ error: 'must not be empty' });
  }

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
};
