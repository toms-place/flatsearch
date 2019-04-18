var User = require('../models/home');

exports.loggedIn = function (req, res, next) {
	if (req.session.user) { // req.session.passport._id

		next();

	} else {

		res.redirect('/');

	}

}

exports.userReload = async function (req, res, next) {
	if (req.session.user) { // req.session.passport._id

		try {
			// find a user whose email is the same as the sessions email
			let user = await User.findOne({
				'mail': req.session.user.mail
			});

			req.session.user = user;
		} catch (error) {
			if (error) req.flash("error", error)
		}

		next();

	} else {

		next();

	}
};

exports.change_plz_interests = async function (req, res, next) {
	if (req.session.user) { // req.session.passport._id

		try {
			// find a user whose email is the same as the sessions email
			let user = await User.findOne({
				'mail': req.session.user.mail
			});

			let plz_interests = [];
			let plz_remove = [];

			if (Array.isArray(req.body.plz_interests)) {
				for (let plz of req.body.plz_interests) {
					plz_interests.push(parseInt(plz));
				}
			} else if (req.body.plz_interests != undefined) {
				if (req.body.plz_interests.length > 0) {
					plz_interests.push(parseInt(req.body.plz_interests));
				}
			}
			if (Array.isArray(req.body.plz_remove)) {
				for (let plz of req.body.plz_remove) {
					plz_remove.push(parseInt(plz));
				}
			} else if (req.body.plz_remove != undefined) {
				if (req.body.plz_remove.length > 0) {
					plz_remove.push(parseInt(req.body.plz_remove));
				}
			}

			user.plz_interests = user.plz_interests.filter(plz => plz_remove.indexOf(plz) === -1);
			user.plz_interests = user.plz_interests.concat(plz_interests);
			user.plz_interests.sort();

			let uniq = a => [...new Set(a)];
			user.plz_interests = uniq(user.plz_interests);

			await user.save();

		} catch (error) {
			if (error) req.flash("error", error);
		}

		res.redirect('/');

	} else {

		res.redirect('/');

	}
};

exports.logout = function (req, res) {
	req.session.destroy(() => {
		res.redirect('/');
	});
};

exports.home = function (req, res) {

	res.render('home', {
		title: "Flatsearch",
		session: req.session,
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
				req.session.destroy(() => {
					res.render('home', {
						success: "Account deleted..",
						error: "",
						session: req.session,
						title: "Flatsearch"
					});
				});
			} else {
				res.render('home', {
					error: "You must be logged in to delete your account.",
					session: req.session,
					title: "Flatsearch"
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

exports.delete_on_activation = async function (req, res) {

	// find a user whose email is the same as the forms email
	let user = await User.findOne({
		'mail': req.query.email
	});

	if (user) {
		if (user.active_hash == req.query.active_link) {

			User.deleteOne({
				mail: req.query.email
			}, function (err, user) {
				if (err) throw err;

				if (user.deletedCount == 1) {
					req.session.destroy(() => {
						res.render('home', {
							success: "Account deleted..",
							error: "",
							session: req.session,
							title: "Flatsearch"
						});
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