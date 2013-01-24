var Scheduleme = require('../helpers/global');

var Employee = {

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
		console.log('in Model.Employee.login');
		var email = req.body.email;
		if (typeof email != 'undefined' && email != '' && typeof req.body.password != 'undefined') {
			var password = Scheduleme.Helpers.Helpers.calcHash(req.body.password);
			//console.log('Email: '+email+' Password: '+password);
			//Search object for account lookup
			var where = new Object();
			var loginQuery='';
			if (Scheduleme.Helpers.Helpers.is_email(email)) {
				console.log('is an email');
				loginQuery = 'SELECT employee_id, email, username, first_name, last_name, employer_id FROM employees WHERE email=? AND password=? LIMIT 1';
				where.email = email;
			} else { //is username
				where.username = email;
				loginQuery = 'SELECT employee_id, email, username, first_name, last_name, employer_id FROM employees WHERE username=? AND password=? LIMIT 1';
			}

			var response = {};
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
						req.session.employee_id = row[0].employee_id;
						req.session.email = row[0].email;
						req.session.username = row[0].username;
						req.session.first_name = row[0].first_name;
						req.session.last_name = row[0].last_name;
						req.session.employer = row[0].employer_id;

						response.statusCode = 200;
						Scheduleme.Helpers.Render.code(req.xhr, res, response);

						db.query("UPDATE employees SET login_count=login_count+1, last_login=NOW() WHERE employee_id=?", [req.session.employee_id], function (err, numAffected) {
							if (err) {
								console.log('ERROR:: Updating employer login: '+err);
							}
						})
						//Track login

					} else {
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
	},
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
	if (typeof obj.employer == 'undefined') {
		console.log('No employer passed');
		//Exit here or something
	}
	if (typeof obj.id == 'undefined') {
		Scheduleme.Helpers.Render.code(req)
	}

	id 			= obj.id;
	employer 	= obj.employer;
	xhr 		= obj.xhr;
	res 		= obj.res;
	response 	= typeof obj.response != 'undefined' ? obj.response : {};

	query = 'SELECT * FROM employees WHERE employee_id=? LIMIT 1';
	db.query(query, [id], function (err, row) {
		if (err) {
			response.statusCode = 500;
			response.message = err.code;
			console.log(err.code);
			Scheduleme.Helpers.Render.code(req.xhr, res, response);

		} else {
			if (row[0]) {
				response.statusCode = 200;

				response.data = row[0];

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
	employer 	= obj.employer;
	xhr			= obj.xhr;
	res 		= obj.res;
	response 	= typeof obj.response != 'undefined' ? obj.response : {};

	response.schedules = [];

	query = 'SELECT schedule_id, date, type, image_loc AS url FROM schedules WHERE employer_id=? AND awaitingupload = false';

	db.query(query, [employer])
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
exports.login = Employee.login;