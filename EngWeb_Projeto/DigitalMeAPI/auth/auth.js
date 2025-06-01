const jwt = require('jsonwebtoken');

module.exports.validateUser = (req, res, next) => {
    var token = req.get('Authorization');
    if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).jsonp({ error: 'Invalid or missing Authorization header' });
    }

    token = token.split(' ')[1];

    if (token) {
        jwt.verify(token, "digitalMeKey", (err, payload) => {
            if (err) res.status(401).jsonp(err);
            else {
                req.userID = payload.userID;
                req.admin = payload.admin; 
                next();
            }
        })
    } else {
        res.status(401).jsonp({error: "Inexistent token"});
    }
};

module.exports.validateAdmin = (req, res, next) => {
    var token = req.get('Authorization');

    token = token.split(' ')[1];

    if (token) {
        jwt.verify(token, "digitalMeKey", (err, payload) => {
            if (err) res.status(401).jsonp(err);
            else {
                if (payload.admin) {
                    next();
                } else {
                    res.status(403).jsonp("User has no Admin permissions.");
                }
            }
        })
    } else {
        res.status(401).jsonp({error: "Inexistent token"});
    }
};