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
