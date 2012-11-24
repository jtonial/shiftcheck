var models = require('../models/models.js')
	, crypto = require('crypto')
	, mongoose = require('mongoose')
	;

calcHash = function (val) {
	var shasum = crypto.createHash('sha1')
		, salt = 'schedule12101991';

	return shasum.update(val+salt).digest('hex');
	//return val;
}

exports.index = function(req, res){
	res.setHeader('Content-Type','text/html');
	if (typeof req.session.loggedin != 'undefined') {
		if (typeof req.session.employeeid != 'undefined') {
			res.render('dash', { title: 'Schedule.me' });
		} else { //It is an employer signed in
			res.render('admin', { title: 'Schedule.me' });
		}
	} else {
		res.render('welcome', { title: 'Schedule.me' });
	}
};

exports.logout = function (req, res) {
	var message = 'Logged out';
	req.session.destroy();
	console.log(message);
	res.redirect('/');
};

exports.loginPage = function (req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('login', { title: 'Schedule.me' });
};

exports.loginProcess = function (req, res) {
	var email = req.body.email;
	//This will have to be the hashed/salted password
	var password = calcHash(req.body.password);
	console.log('Email: '+email+'; Password: '+password);

	//Determine if it is a username or email
	var where = new Object();
	var is_email = true; //This should be a regex match
	if (is_email) {
		console.log('is an email');
		where.email = email;
	} else { //is username
		console.log('is not email... somethigns wrong');
		where.email = email;
	}
	console.log(where)
	//Access db to get users info
	models.Employee.findOne ( where, function (err, doc) {
		console.log('in signin callback - employee');
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
					console.log('login success');
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

exports.adminloginPage = function (req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('admin-login', { title: 'Schedule.me' });
};

exports.adminloginProcess = function (req, res) {
	var email = req.body.email;
	//This will have to be the hashed/salted password
	var password = calcHash(req.body.password);
	console.log('Email: '+email+'; Password: '+password);

	//Access db to get users info
	models.Employer.findOne ( {email: email}, function (err, doc) {
		console.log('in signin callback - admin');
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
					console.log('login success');
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

exports.signup = function (req, res) {
	res.render('signup', { title: 'Schedule.me' });
};
