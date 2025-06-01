var mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    admin: Boolean,
    googleId: String,
    facebookId: String,
    creationDate: Date
}, {versionKey : false});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('users', userSchema)