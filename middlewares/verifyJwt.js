const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: 'Access Denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({ error: 'Token has expired' });
        } else if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({ error: 'Invalid token' });
        } else {
          return res.status(403).json({ error: 'Authentication failed' });
        }
      }

      req.user = decoded;
      console.log(req.user,"reqUser")
      next();
    });
  } catch (err) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }
};

module.exports = verifyToken;
