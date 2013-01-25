var Scheduleme = require('../helpers/global');

exports.trackRequest = function (req) {
	if (Scheduleme.Config.debug) console.log('Tracking Request');

	var user_type = '';
	if (typeof req.session.employer_id !== 'undefined') {
		user_type 	= 'employer';
		id 		= req.session.employer_id;
	} else if (typeof req.session.employee_id !== 'undefined') {
		user_type 	= 'employee';
		id 		= req.session.employee_id;
	} else {
		user_type 	= 'none';
		id 		= null;
	} 

	var method 	= req.method.toUpperCase();
	var url 	= req.url;
	var time 	= Date();
	var ip 		= Scheduleme.Helpers.Helpers.getClientIp(req);

	var query = "INSERT INTO track_requests (user_type, id, method, url, time, ip) VALUES (?,?,?,?,?,?)"

	db.query(query, [user_type, id, method, url, time, ip], function (err, result) {
		if (err) {
			console.log('Insert error in trackRequest');
		}
	});
};

exports.trackLogin = function (obj) { //req, type, id, statusCode) {
	if (Scheduleme.Config.debug) console.log('Tracking Login');

	var user_type 	= obj.type;
	var id 			= obj.id;
	var time 		= Date();
	var ip 			= obj.ip;
	var statusCode	= obj.statusCode;

	var query = "INSERT INTO track_request (user_type, id, time, ip, statusCode) VALUES (?,?,?,?,?)"

	db.query(query, [user_type, id, time, ip, statusCode], function (err, result) {
		if (err) {
			console.log('Insert error in trackRequest');
		}
	});
};