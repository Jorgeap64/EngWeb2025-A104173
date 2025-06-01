var express = require('express');
var router = express.Router();
var User = require('../controllers/user');
var Aip = require('../controllers/aip');
var userModel = require('../models/user');
var passport = require('passport');
var jwt = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

var Auth = require('../auth/auth');

passport.use(new GoogleStrategy({
  clientID: '1099278811560-2tfobqog9jlksrc20rg2kbpgmpfdspdo.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:7777/user/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await userModel.findOne({ googleId: profile.id });
    if (!user) {
      user = await userModel.create({
        username: profile.displayName,
        googleId: profile.id,
        name: profile.displayName,
        admin: false,
        email: profile.emails?.[0]?.value || '',
        creationDate: new Date()
      });
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

passport.use(new FacebookStrategy({
  clientID: '567838039251795',
  clientSecret: 'eafffdc720d6641c9eb5f8706bf5111c',
  callbackURL: 'http://localhost:7777/user/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await userModel.findOne({ facebookId: profile.id });
    if (!user) {
      user = await userModel.create({
        username: profile.displayName,
        facebookId: profile.id,
        name: profile.displayName,
        admin: false,
        email: profile.emails?.[0]?.value || '',
        creationDate: new Date()
      });
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));


router.get('/', Auth.validateAdmin, async function(req, res, next) {
  const numUsers = await User.countUsers();
  const numArchives = await Aip.countAips();

  User.findAll()
    .then(users => {
        res.status(200).jsonp({ users, numUsers, numArchives });
    })
    .catch(error => {
      console.error(error);
      res.status(500).jsonp({ error });
    });
});

router.get('/:id', Auth.validateAdmin, async function(req, res, next) {
  const numUsers = await User.countUsers();
  const numArchives = await Aip.countAips();

  User.findUserByID(req.params.id)
    .then(user => {
        res.status(200).jsonp({ user, numUsers, numArchives });
    })
    .catch(error => {
      console.error(error);
      res.status(500).jsonp({ error });
    });
});

router.put('/:id', Auth.validateAdmin, async function(req, res, next) {
  const { username, name, email } = req.body;

  try {
    const updatedUser = await User.updateById(req.params.id, {
      username,
      name,
      email
    });

    res.status(200).jsonp({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).jsonp({ error: 'Failed to update user' });
  }
});

router.delete('/:id', Auth.validateAdmin, function(req, res, next) {
  User.deleteById(req.params.id)
    .then(data => {
        res.status(200).jsonp({ data });
    })
    .catch(error => {
      console.error(error);
      res.status(500).jsonp({ error });
    });
});

router.post('/register', function(req, res, next) {
  userModel.register({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
    admin: req.body.admin || false,
    creationDate: new Date()
  }, 
  req.body.password,
  (err, user) => {
    if (err) res.jsonp(err)
    else res.send('Success')
  })
});

router.post('/login', passport.authenticate('local'), function(req, res, next) {
  jwt.sign(
    {
      userID: req.user._id,
      admin: req.user.admin,
      sub: 'digitalMeToken'
    },
    "digitalMeKey",
    { expiresIn: 3600 },
    (err, token) => {
      if (err) res.status(500).jsonp(err)
      else res.status(201).jsonp({ token });
    }
  );
});

router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const token = jwt.sign({
      userID: user._id,
      admin: user.admin,
      sub: 'digitalMeToken'
    }, "digitalMeKey", { expiresIn: 3600 });

    res.redirect(`http://localhost:1234/oauth-success?token=${token}`);
  })(req, res, next);
});

router.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['email']
}));

router.get('/auth/facebook/callback', (req, res, next) => {
  passport.authenticate('facebook', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const token = jwt.sign({
      userID: user._id,
      admin: user.admin,
      sub: 'digitalMeToken'
    }, "digitalMeKey", { expiresIn: 3600 });

    res.redirect(`http://localhost:1234/oauth-success?token=${token}`);
  })(req, res, next);
});

module.exports = router;