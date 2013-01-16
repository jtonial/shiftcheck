var models = require('../models/models.js')
	, crypto = require('crypto')
	, mongoose = require('mongoose')
	;

//Helpers
calcHash = function (val) {
	var shasum = crypto.createHash('sha1')
		, salt = 'schedule12101991';

	return shasum.update(val+salt).digest('hex');
};
is_email = function (email) {
	var reg_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return reg_email.test(email);
};
getClientIp = function(req) {
	var ipAddress;
	// Amazon EC2 / Heroku workaround to get real client IP
	var forwardedIpsStr = req.header('x-forwarded-for'); 
	if (forwardedIpsStr) {
		// 'x-forwarded-for' header may return multiple IP addresses in
		// the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
		// the first one
		var forwardedIps = forwardedIpsStr.split(',');
		ipAddress = forwardedIps[0];
	}
	if (!ipAddress) {
		// Ensure getting client IP address still works in
		// development environment
		ipAddress = req.connection.remoteAddress;
	}
	return ipAddress;
};
trackLogin = function (req, type, id, statusCode) {
	var o = {};

	o.user_type = type;

	if (typeof id != 'undefined' && id !== '') {
		o.id = id;
	}

	o.method = req.method;
	o.url = req.url;
	o.time = Date();
	o.ip = getClientIp(req);
	o.statusCode = statusCode;

	var tracking = new models.TrackLogin(o);
	tracking.save(function(err, s) {
		if (!err) {
			console.log();
		} else {
			console.log('Error tracking page load...');
		}
	});
};

exports.loginProcess = function (req, res) {
	var email = req.body.email;
	var password = calcHash(req.body.password);
	console.log('Email: '+email+' Password: '+password);
	//Search object for account lookup
	var where = {};

	if (is_email(email)) {
		console.log('is an email');
		where.email = email;
	} else { //is username
		where.username = email;
	}

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
					trackLogin(req, 'employee', doc._id, 200);
				} else {
					render.code400(req,res);
					console.log('login failure');
					trackLogin(req, 'employee', doc._id, 400);
				}
			} else {
				render.code400(req,res);
				console.log('login failure');
				trackLogin(req, 'employee', '', 400);
			}
		} else {
			render.code500(req,res);
			trackLogin(req, 'employee', '', 500);
		}
	});
};

exports.adminloginProcess = function (req, res) {
	var email = req.body.email;
	var password = calcHash(req.body.password);
	console.log('Email: '+email+' Password: '+password);
	//Search object for account lookup
	var where = {};

	if (is_email(email)) {
		console.log('is an email');
		where.email = email;
	} else { //is username
		where.username = email;
	}

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
					trackLogin(req, 'employer', doc._id, 200);
				} else {
					res.statusCode = 400;
					res.end();
					console.log('login failure');
					trackLogin(req, 'employer', doc._id, 400);
				}
			} else {
				res.statusCode = 400;
				res.end();
				console.log('login failure');
				trackLogin(req, 'employer', '', 400);
			}
		} else {
			res.statusCode = 500;
			res.end();
			trackLogin(req, 'employer', '', 500);
		}
	});
};

exports.logout = function (req, res) {
	var message = 'Logged out';
	req.session.destroy();
	console.log(message);
	res.redirect('/');
};