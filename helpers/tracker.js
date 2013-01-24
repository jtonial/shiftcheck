var Scheduleme = require('../helpers/global');

exports.trackRequest = function (req) {
	if (Scheduleme.Config.debug) console.log('Tracking Request');
	/*var o = {};

	if (employee) {
		o.user_type = 'employee';
		o.id = req.session.employeeid;
	} else if (employer) {
		o.user_type = 'employer';
		o.id = req.session.employerid;
	} else {
		o.user_type = 'undefined';
	}
	o.method = req.method;
	o.url = req.url;
	o.time = Date();
	o.ip = Scheduleme.Helpers.Helpers.getClientIp(req);

	var tracking = new models.Tracking(o);
	tracking.save(function(err, s) {
		if (!err) {
			console.log();
		} else {
			console.log('Error tracking page load...');
		}
	});*/
};

exports.trackLogin = function (req, type, id, statusCode) {
	if (Scheduleme.Config.debug) console.log('Tracking Login');
	/*var o = {};

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
	});*/
};