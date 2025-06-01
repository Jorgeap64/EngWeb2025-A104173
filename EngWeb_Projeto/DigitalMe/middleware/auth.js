const jwt = require('jsonwebtoken');

module.exports.ensureAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, 'digitalMeKey', (err, decodedToken) => {
    if (err) {
      return res.redirect('/login');
    } 
    else {
      req.userID = decodedToken.userID;
      req.admin = decodedToken.admin;
      next();
    }
  });
};

module.exports.ensureAuthenticatedUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, 'digitalMeKey', (err, decodedToken) => {
    if (err) {
      return res.redirect('/login');
    }
    else if (decodedToken.admin) {
      return res.redirect('/');
    } else {
      req.userID = decodedToken.userID;
      next();
    }
  });
};
  
module.exports.redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return next();

  jwt.verify(token, "digitalMeKey", (err, decoded) => {
    if (err) return next();
    return res.redirect('/dashboard');
  });
};

module.exports.ensureAuthenticatedAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, 'digitalMeKey', (err, decodedToken) => {
    if (err || !decodedToken.admin) {
      return res.redirect('/');
    } else {
      req.userID = decodedToken.userID;
      next();
    }
  });
};