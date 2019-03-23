var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var User = require('../models/home');

exports.loggedIn = function (req, res, next) {
	if (req.session.user) { // req.session.passport._id

		next();

	} else {

		res.redirect('/');

	}

}

exports.home = function (req, res) {
	if (req.session.user) { // req.session.passport._id

		res.render('home', {
			title: "Flatsearch",
			name: req.session.user.name,
			error: req.flash("error"),
			success: req.flash("success"),
		});

	} else {

		res.render('home', {
			title: "Flatsearch",
			name: "",
			error: req.flash("error"),
			success: req.flash("success"),
		});

	}


}

exports.me = function (req, res) {

	res.render('me', {
		title: "me",
		user: req.session.user,
		error: req.flash("error"),
		success: req.flash("success"),
	});

}


exports.signup = function (req, res) {

	if (req.session.user) {

		res.redirect('/');

	} else {

		res.render('signup', {
			error: req.flash("error"),
			success: req.flash("success"),
			session: req.session,
			title: "signup"
		});
	}

}

exports.confirm = async function (req, res) {

	// find a user whose email is the same as the forms email
	let user = await User.findOne({
		'mail': req.query.email
	});

	if (user) {
		if (user.status == 'inactive' && user.active_hash == req.query.active_link) {
			user.status = 'active';
			await user.save(function (err) {
				if (err) throw err;
				return;
			});
			res.render('home', {
				error: req.flash("error"),
				success: "You successfully confirmed your account. Please sign in!",
				session: req.session,
				title: "Flatsearch",
				name: ""
			});
		} else if (user.status == 'active') {
			res.render('home', {
				error: req.flash("error"),
				success: "You already confirmed your account. Please sign in!",
				session: req.session,
				title: "Flatsearch",
				name: ""
			});
		}
	} else {
		res.render('signup', {
			error: "We could not find a user with this E-Mail. Please sign up!",
			success: req.flash("success"),
			session: req.session,
			title: "signup"
		});
	}

}

exports.delete = function (req, res) {

	if (req.session.user) {

		User.deleteOne({
			mail: req.session.user.mail
		}, function (err, user) {
			if (err) throw err;

			if (user.deletedCount == 1) {
				res.render('signup', {
					error: "Your account has been deleted..",
					success: "Do you want to signup again?",
					session: req.session,
					title: "signup"
				});
			} else {
				res.render('home', {
					error: "You must be logged in to delete your account.",
					success: req.flash("success"),
					session: req.session,
					title: "Flatsearch",
					name: ""
				});
			}
		});


	} else {
		res.render('home', {
			error: "You must be logged in to delete your account.",
			success: req.flash("success"),
			session: req.session,
			title: "Flatsearch",
			name: ""
		});
	}


}