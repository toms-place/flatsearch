
//app/models/user.js
//load the things we need
var mongoose = require('mongoose');

//define the schema for our user model
var userSchema = mongoose.Schema({
	_id:{ type: Number, default: 1 },
	name: String,
	mail: String,
	password: String,
	status: String,
	created_date: Date,
	updated_date: Date,
	active_hash: String,
	role_id: { type: Number, default: 2 },
	newsletter: { type: Boolean, default: true },
	plz_interests: { type: Array, default: [] },
	flats: { type: Array, default: [] },
});

//create the model for users and expose it to our app
module.exports = mongoose.model('ex_users', userSchema);