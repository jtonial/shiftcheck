var Scheduleme = require('../helpers/global');

var Employer = {

	data: {

	},
	save : function () {
		if (Scheduleme.Config.debug) console.log('Saving Employee');
		return true;
	},
	update : function () {
		if (Scheduleme.Config.debug)console.log('Updating Employee');
	},
	delete : function () {
		if (Scheduleme.Config.debug)console.log('Updating Employee');
	},

	login : function (req, res) {
		console.log('in Model.Employer.login');
		var email = req.body.email;
		if (typeof email != 'undefined' && email != '' && typeof req.body.password != 'undefined') {
			var password = Scheduleme.Helpers.Helpers.calcHash(req.body.password);
			//console.log('Email: '+email+' Password: '+password);
			//Search object for account lookup
			var where = new Object();
			var loginQuery='';
			if (Scheduleme.Helpers.Helpers.is_email(email)) {
				console.log('is an email');
				loginQuery = 'SELECT employer_id, name, email, username, contact_email, contact_phone, contact_address FROM employers WHERE email=? AND password=? LIMIT 1';
				where.email = email;
			} else { //is username
				where.username = email;
				loginQuery = 'SELECT employer_id, name, email, username, contact_email, contact_phone, contact_address FROM employers WHERE username=? AND password=? LIMIT 1';
			}

			var response = Object();
			response.statusCode = 400; //This is set for the case when no records are returned
			db.query(loginQuery, [email,password], function (err, row) {
				if (err) {
					//Handle error, and 'end' event will be emitted after this.
					response.statusCode = 500;
					response.message = err.code;
					console.log(err.code);
					Scheduleme.Helpers.Render.code(req.xhr, res, response);
				} else {
					if (row[0]) {

						req.session.loggedin = true;
						req.session.employer_id = row[0].employer_id;
						req.session.email = row[0].email;
						req.session.username = row[0].username;

						response.statusCode = 200;
						Scheduleme.Helpers.Render.code(req.xhr, res, response);

						db.query("UPDATE employers SET login_count=login_count+1, last_login=NOW() WHERE employer_id=?", [req.session.employer_id], function (err, result) {
							if (err) {
								console.log('ERROR:: Updating employer login: '+err);
							}
						})

					} else {
						response.statusCode = 400;
						Scheduleme.Helpers.Render.code(req.xhr, res, response);
					}

					var trackingInput = {
						type 		: 'employer',
						id 			: row[0].employer_id,
						ip 			: Scheduleme.Helpers.Helpers.getClientIp(req),
						statusCode	: response.statusCode
					};
					Scheduleme.Tracking.trackLogin(trackingInput);
				}
			});
		} else {
			var response = Object();
			response.statusCode = 400;
			response.message = 'Email is missing or empty';
			Scheduleme.Helpers.Render.code(req.xhr, res, response);
		}
	}
};

exports.new = function (object) {
	return Object.create(Employee);
}

//Export static methods
exports.fetch = function (obj, cb, cb2) {
	//Note: this is queries['selectEmployer']; I need to globalize this

	if (typeof obj.id == 'undefined') {
		//Scheduleme.Helpers.Render.code(req)
		console.log('No id; Model.Employer.fetch');
	}

	id 			= obj.id;
	response 	= typeof obj.response != 'undefined' ? obj.response : {};

	query = 'SELECT * FROM employers WHERE employer_id=? LIMIT 1';
	db.query(query, [id], function (err, row) {
		if (err) {
			response.statusCode = 500;
			response.message = err.code;
			console.log(err.code);
			cb2(response);

		} else {
			if (row[0]) {
				response.statusCode = 200;

				response.data = row[0];

				obj.response = response;

				cb(obj, cb2);
			} else {
				response.statusCode = 404;
				cb2(response);
			}
		}
	});
}

/*
	input = {
		id 			=> Employer id
		oldpassword => Employers old password
		newpassword => Employers new password
	}
*/
exports.changePassword = function (obj, cb) {

	//I should probably do some validation here
	var query = "UPDATE employers SET password=? WHERE employer_id=? AND password=? LIMIT 1";

	db.query(query, [newpassword, id, oldpassword], cb);

}

exports.login = Employer.login;