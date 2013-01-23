var crypto = require('crypto')
	;

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