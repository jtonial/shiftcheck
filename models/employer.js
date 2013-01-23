var Employer = {

	data: {

	},
	save : function () {
		if (config.debug) console.log('Saving Employee');
		return true;
	},
	update : function () {
		if (config.debug)console.log('Updating Employee');
	},
	delete : function () {
		if (config.debug)console.log('Updating Employee');
	},

	login : function (req, res) {
		console.log('in Model.Employer.login');
		var email = req.body.email;
		if (typeof email != 'undefined' && email != '' && typeof req.body.password != 'undefined') {
			var password = Scheduleme.Helpers.Helpers.calcHash(req.body.password);
			console.log('Email: '+email+' Password: '+password);
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

						console.log('Session: '+JSON.stringify(req.session));

						response.statusCode = 200;
						Scheduleme.Helpers.Render.code(req.xhr, res, response);

						console.log('login success');
						db.query("UPDATE employers SET login_count=login_count+1, last_login=NOW() WHERE employer_id=?", [req.session.employer_id], function (err, result) {
							if (err) {
								console.log('ERROR:: Updating employer login: '+err);
							} else {
								console.log('Updated: Affected Rows: '+result.affectedRows);
							}
						})

					} else {
						console.log('login failure');
						response.statusCode = 400;
						Scheduleme.Helpers.Render.code(req.xhr, res, response);
					}
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
exports.fetch = function (obj, next) {
	//Note: this is queries['selectEmployer']; I need to globalize this

	if (typeof obj.res == 'undefined') {
		console.log('No response object passed');
		//Exit here or something
	}
	if (typeof obj.xhr == 'undefined') {
		console.log('No xhr status passed');
		//Exit here or something
	}
	if (typeof obj.id == 'undefined') {
		Scheduleme.Helpers.Render.code(req)
	}

	id 			= obj.id;
	xhr 		= obj.xhr;
	res 		= obj.res;
	response 	= typeof obj.response != 'undefined' ? obj.response : {};

	query = 'SELECT * FROM employers WHERE employer_id=? LIMIT 1';
	db.query(query, [id], function (err, row) {
		if (err) {
			response.statusCode = 500;
			response.message = err.code;
			console.log(err.code);
			Scheduleme.Helpers.Render.code(req.xhr, res, response);

		} else {
			if (row[0]) {
				response.statusCode = 200;

				response.data = row;

				obj.response = response;

				next(obj);
			} else {
				response.statusCode = 404;
				Scheduleme.Helpers.Render.code(req.xhr, res, response);
			}
		}
	});
}
exports.fetchSchedules = function (obj) {

	id 			= obj.id;
	xhr			= obj.xhr;
	res 		= obj.res;
	response 	= typeof obj.response != 'undefined' ? obj.response : {};

	response.schedules = [];

	query = 'SELECT * FROM schedules WHERE employer_id=? AND awaitingupload = false'

	db.query(query, [id])
		.on('error', function (err) {
			//Handle error, and 'end' event will be emitted after this.
			response.statusCode = 500;
			response.message = err.code;
			response.schedules = [];
			console.log(err.code);
		})
		.on('fields', function (fields) {
			//The field packets for the rows to follow

			//This fires once, whether or not row are returned
			//console.log ('in fields callback');
		})
		.on('result', function (row) {
			response.schedules.push(row);
		})
		.on('end', function () {
			Scheduleme.Helpers.Render.code(xhr, res, response);
		})
}
exports.login = Employer.login;