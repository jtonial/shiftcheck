exports.loginPage = function (req, res) {
	res.render('login', { title: 'Schedule.me' });
};

exports.adminloginPage = function (req, res) {
	res.render('admin-login', { title: 'Schedule.me' });
};

exports.signup = function (req, res) {
	res.render('signup', { title: 'Schedule.me' });
};

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

exports.uploadVerified = function (req, res) {
	res.render('uploadVerified', { title: 'Schedule.me' });
};
exports.uploadVerifiedBadReq = function (req, res) {
	res.statusCode = 400;
	res.render('uploadVerifiedBadReq', { title: 'Schedule.me' });
};
exports.uploadVerifiedFailed = function (req, res) {
	res.render('uploadVerifiedFailed', { title: 'Schedule.me' });
};
//Codes
exports.code = function (xhr, res, obj) {
	if (xhr) {
		res.statusCode = obj.statusCode;
		res.end(JSON.stringify(obj));
	} else {
		res.statusCode = obj.statusCode;
		switch (obj.statusCode) {
			case 200:
				res.end(JSON.stringify(obj));
				break;
			case 201:
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