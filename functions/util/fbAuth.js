const { admin, db } = require('./admin');

module.exports = async (req, res, next) => {
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
    req.user.imageUrl = abc.docs[0].data().imageUrl;
    return next();
  } catch (err) {
    console.error(err);
    return res.status(403).json(err);
  }
};
