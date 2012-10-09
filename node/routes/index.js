var models = require('../models/models.js')
	, crypto = require('crypto')
	;

calcHash = function (val) {
	var shasum = crypto.createHash('sha1')
		, salt = 'schedule12101991';

	//return shasum.update(val+salt).digest('hex');
	return val;
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

/*
 * What should I do if a login request comes but a user is already signed in? Sign out the first use and in the new, or redirect to the dash with original user?
 */
exports.loginProcess = function (req, res) {	//This will not return this after I switch to an AJAX login. It will return a 200 code on success, or 400 with an error message on error
	var email = req.body.email;
	//This will have to be the hashed/salted password
	var password = calcHash(req.body.password);
	console.log('Email: '+email+'; Password: '+password);

	//Access db to get users info
	models.Employee.findOne ( {email: email}, function (err, docs) {
		if (docs) {
			if (docs.password == password) { //If signed in
				req.session.loggedin = true;
				req.session.employeeid = docs._id;
				req.session.email = email;
				req.session.fname = docs.first_name;
				req.session.lname = docs.last_name;
				req.session.fullname = docs.first_name+' '+docs.last_name;
				req.session.company = docs.company;

				res.statusCode = 200;
				res.end();
				console.log('login success');
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
	});
};

exports.adminloginPage = function (req, res) {
	res.setHeader('Content-Type','text/html');
	res.render('admin-login', { title: 'Schedule.me' });
};

/*
 * What should I do if a login request comes but a user is already signed in? Sign out the first use and in the new, or redirect to the dash with original user?
 */
exports.adminloginProcess = function (req, res) {	//This will not return this after I switch to an AJAX login. It will return a 200 code on success, or 400 with an error message on error
	var email = req.body.email;
	//This will have to be the hashed/salted password
	var password = calcHash(req.body.password);
	console.log('Email: '+email+'; Password: '+password);

	//Access db to get users info
	models.Employer.findOne ( {email: email}, function (err, docs) {
		if (docs) {
			if (docs.password == password) { //If signed in
				req.session.loggedin = true;
				req.session.employerid = docs._id;
				req.session.email = email;
				req.session.fname = docs.first_name;
				req.session.lname = docs.last_name;
				req.session.fullname = docs.first_name+' '+docs.last_name;
				req.session.company = docs.company;

				res.statusCode = 200;
				res.end();
				console.log('login success');
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
	});
};

exports.signup = function (req, res) {
	res.render('signup', { title: 'BlastAPI' });
};
