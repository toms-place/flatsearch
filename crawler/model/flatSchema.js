
//load the things we need
var mongoose = require('mongoose');

//define the schema for our user model
var flatSchema = mongoose.Schema({
	_id:{ type: Number, default: 1 },
    website,
    district: Number,
    city,
    address,
    link,
    rooms: Number,
    size: Number,
    costs: Number,
    deposit: Number,
    funds: Number,
    legalform,
    title,
    status,
    info,
    docs,
    images,
    crawlTime: Date,
});

//create the model for users and expose it to our app
module.exports = mongoose.model('flat', flatSchema);