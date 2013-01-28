console.log('Loading render helpers...');

var Scheduleme = require('../helpers/global');

exports.renderLoginPage = function (req, res) {
	res.render('login', { title: 'Schedule.me' });
};

exports.renderAdminloginPage = function (req, res) {
	res.render('manager-login', { title: 'Schedule.me' });
};

exports.signup = function (req, res) {
	res.render('signup', { title: 'Schedule.me' });
};

exports.index = function(req, res){
	res.setHeader('Content-Type','text/html');

	if (typeof req.session.employee_id != 'undefined') {
		res.render('dash', { title: 'Schedule.me' });
	} else if (typeof req.session.employer_id != 'undefined') { //It is an employer signed in
		res.render('admin', { title: 'Schedule.me' });
	} else {
		res.render('welcome', { title: 'Schedule.me' });
	}

};

exports.uploadVerified = function (req, res) {
	res.statusCode = 200;
	res.render('uploadVerified', { title: 'Schedule.me' });
};
exports.uploadVerifiedBadReq = function (req, res) {
	res.statusCode = 400;
	res.render('uploadVerifiedBadReq', { title: 'Schedule.me' });
};
exports.uploadVerifiedFailed = function (req, res) {
	res.statusCode = 500;
	res.render('uploadVerifiedFailed', { title: 'Schedule.me' });
};
//Codes
exports.code = function (xhr, res, obj) {
	// I should put certain attributes into their own objects here (meta?)
		// statusCode
		// message
		// startTime
		// endTime
		// duration
		
	res.statusCode = obj.statusCode;

	if (xhr) {
		res.header('Content-Type', 'application/json');
		res.end(JSON.stringify(obj));
	} else {
		switch (obj.statusCode) {
			case 200: // Okay
				res.header('Content-Type', 'application/json');
				res.end(JSON.stringify(obj));
				break;
			case 201: // Created
				res.header('Content-Type', 'application/json');
				res.end(JSON.stringify(obj));
				break;
			case 401:
				res.render('403', { title: 'Schedule.me' });
				break;
			case 403:
				res.render('403', { title: 'Schedule.me' });
				break;
			case 404:
				res.render('404', { title: 'Schedule.me' });
				break;
			case 500:
				res.render('500', { title: 'Schedule.me' });
				break;
		}
	}
};
exports.code401 = function (req, res) {
	res.statusCode = 401;
	if (req.xhr) {
		res.end();
	} else {
		res.render('401', { title: 'Schedule.me' });
	}
};
exports.code403 = function (req, res) {
	res.statusCode = 403;
	if (req.xhr) {
		res.end();
	} else {
		res.render('403', { title: 'Schedule.me' });
	}
};
exports.code404 = function (req, res) {
	res.statusCode = 404;
	if (req.xhr) {
		res.end();
	} else {
		res.render('404', { title: 'Schedule.me' });
	}
};
exports.code500 = function (req, res) {
	res.statusCode = 500;
	if (req.xhr) {
		res.end();
	} else {
		res.render('500', { title: 'Schedule.me' });
	}
};