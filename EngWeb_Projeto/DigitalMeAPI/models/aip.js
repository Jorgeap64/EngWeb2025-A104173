var mongoose = require('mongoose')

var aipSchema = new mongoose.Schema({
    creation_date: Date,
    submission_date: Date,
    producer_id: String,
    sender_id: String,
    name: String,
    originalName: String,
    public: Boolean,
    mimetype: String,
    category: String,
	hashManifest: String,
	hashTag: String
}, {versionKey : false});

module.exports = mongoose.model('aips', aipSchema);