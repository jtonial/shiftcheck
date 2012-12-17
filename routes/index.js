var models = require('../models/models.js')
	, crypto = require('crypto')
	, mongoose = require('mongoose')
	;

//Helpers
calcHash = function (val) {
	var shasum = crypto.createHash('sha1')
		, salt = 'schedule12101991';

	return shasum.update(val+salt).digest('hex');
}

is_email = function (email) {
	var reg_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return reg_email.test(email);
};

exports.loginProcess = function (req, res) {
	var email = req.body.email;
	//This will have to be the hashed/salted password
	var password = calcHash(req.body.password);
	console.log('Email: '+email+'; Password: '+password);

	//Determine if it is a username or email
	var where = new Object();

	if (is_email(email)) {
		console.log('is an email');
		where.email = email;
	} else { //is username
		where.email = email;
	}

	//Access db to get users info
	models.Employee.findOne ( where , function (err, doc) {
		if (!err) {
			if (doc) {
				if (doc.password == password) { //If signed in; If I add password:password check in db query i dont have to check it here
					req.session.loggedin = true;
					req.session.employeeid = doc._id;
					req.session.employer = doc.employer;
					req.session.email = email;
					req.session.fname = doc.first_name;
					req.session.lname = doc.last_name;
					req.session.fullname = doc.first_name+' '+doc.last_name;
					req.session.company = doc.company;

					res.statusCode = 200;
					res.end();

					models.Employee.update({ _id:doc._id },
						{ $inc: {login_count:1}, $set: {last_login: new Date()}}, false, false, function (err) {
							if (err) {
								console.log('Error updating login count: '+err);
							}
						});
				} else {
					res.statusCode = 400;
					res.end();
					console.log('login failure');
				}
			} else {
				res.statusCode = 400;
				res.end();
				console.log('login failure');
			}
		} else {
			res.statusCode = 500;
			res.end();
		}
	});
};

exports.adminloginProcess = function (req, res) {
	var email = req.body.email;
	//This will have to be the hashed/salted password
	var password = calcHash(req.body.password);
	console.log('Email: '+email+'; Password: '+password);

	//Determine if it is a username or email
	var where = new Object();

	if (is_email(email)) {
		console.log('is an email');
		where.email = email;
	} else { //is username
		where.email = email;
	}

	//Access db to get users info
	models.Employer.findOne ( where , function (err, doc) {
		if (!err) {
			if (doc) {
				if (doc.password == password) { //If signed in; If I add password:password check in db query i dont have to check it here
					req.session.loggedin = true;
					req.session.employerid = doc._id;
					req.session.email = email;
					req.session.fname = doc.first_name;
					req.session.lname = doc.last_name;
					req.session.fullname = doc.first_name+' '+doc.last_name;
					req.session.company = doc.company;

					res.statusCode = 200;
					res.end();

					models.Employer.update({ _id:doc._id },
						{$inc: {login_count:1}, $set: {last_login: new Date()}}, false, false, function (err) {
							if (err) {
								console.log('Error updating login count: '+err);
							}
						});
				} else {
					res.statusCode = 400;
					res.end();
					console.log('login failure');
				}
			} else {
				res.statusCode = 400;
				res.end();
				console.log('login failure');
			}
		} else {
			res.statusCode = 500;
			res.end();
		}
	});
};

exports.logout = function (req, res) {
	var message = 'Logged out';
	req.session.destroy();
	console.log(message);
	res.redirect('/');
};