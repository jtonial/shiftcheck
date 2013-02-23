var Scheduleme = require('../helpers/global');
var db = require('../db/dbconnection');

var Employee = {

	data: {

	},
	save : function () {
		if (Scheduleme.Config.debug) Scheduleme.Logger.info('Saving Employee');
		return true;
	},
	update : function () {
		if (Scheduleme.Config.debug) Scheduleme.Logger.info('Updating Employee');
	},
	delete : function () {
		if (Scheduleme.Config.debug) Scheduleme.Logger.info('Updating Employee');
	},
	login : function (req, res) {
		var email = req.body.email;
		if (typeof email != 'undefined' && email != '' && typeof req.body.password != 'undefined') {
			var password = Scheduleme.Helpers.Helpers.calcHash(req.body.password);
			//Search object for account lookup
			var where = new Object();
			var loginQuery='';
			if (Scheduleme.Helpers.Helpers.is_email(email)) {
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
					Scheduleme.Logger.error(err.code);
					Scheduleme.Helpers.Render.code(req.xhr, res, response);
				} else {
					if (row[0]) {

						req.session.employee_id = row[0].employee_id;
						req.session.email 		= row[0].email;
						req.session.username 	= row[0].username;
						req.session.first_name 	= row[0].first_name;
						req.session.last_name 	= row[0].last_name;
						req.session.employer 	= row[0].employer_id;

						response.statusCode = 200;
						Scheduleme.Helpers.Render.code(req.xhr, res, response);

						db.query(Scheduleme.Queries.updateEmployeeLogin, [req.session.employee_id], function (err, numAffected) {
							if (err) {
								Scheduleme.Logger.error('ERROR:: Updating employee login: '+err);
							}
						})
						//Track login
						var trackingInput = {
							type 		: 'employee',
							id 			: row[0].employee_id,
							ip 			: Scheduleme.Helpers.Helpers.getClientIp(req),
							statusCode	: response.statusCode
						};

						Scheduleme.Tracking.trackLogin(trackingInput);
					

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
	}
};

exports.new = function (object) {
	return Object.create(Employee);
};
exports.create = function (obj, cb) {
	
	email 		= obj.email;
	username 	= obj.username;
	pass 		= obj.password;
	fname 		= obj.first_name
	lname 		= obj.last_name;
	employer	= obj.employer_id;

	db.query(Scheduleme.Queries.insertEmployee, [email, username, pass, fname, lname, employer], cb)
};
//Export static methods
exports.fetch = function (obj, cb, cb2) {
	//Note: this is queries['selectEmployer']; I need to globalize this

	if (typeof obj.employer == 'undefined') {
		Scheduleme.Logger.info('No employer passed');
		//Exit here or something
	}
	if (typeof obj.id == 'undefined') {
		Scheduleme.Logger.info('No id; Model.Employer.fetch');
	}

	id 			= obj.id;
	employer 	= obj.employer;
	response 	= typeof obj.response != 'undefined' ? obj.response : {};

	db.query(Scheduleme.Queries.selectEmployee, [id], function (err, row) {
		if (err) {
			response.statusCode = 500;
			response.message = err.code;
			Scheduleme.Logger.error(err.code);
			cb2(response);

		} else {
			if (row[0]) {
				response.statusCode = 200;

				response.data = row[0];

				obj.id = employer;
				obj.response = response;
				cb(obj, cb2);
			} else {
				response.statusCode = 404;
				cb2(response);
			}
		}
	});
}
exports.getByEmployer = function (obj, cb) {
	//Note: this is queries['selectEmployer']; I need to globalize this

	if (typeof obj.employer == 'undefined') {
		Scheduleme.Logger.info('No employer passed');
		//Exit here or something
	}
	if (typeof obj.id == 'undefined') {
		Scheduleme.Logger.info('No id; Model.Employer.fetch');
	}

	employer 	= obj.employer;
	response 	= typeof obj.response != 'undefined' ? obj.response : {};

	db.query(Scheduleme.Queries.selectEmployees, [employer], function (err, rows) {
		if (err) {
			response.statusCode = 500;
			response.message = err.code;
			Scheduleme.Logger.error(err.code);
			cb(err, response);
		} else {
			response.statusCode = 200;
			response.data = {};
			response.data.employees = [];

			rows.forEach (function (row) {
				response.data.employees.push(row);
			})

			cb(err, response);
		}
	});
}
/*
	input = {
		id 			=> Employee id
		oldpassword => Employees old password
		newpassword => Employees new password
	}
*/
exports.changePassword = function (obj, cb) {

	//I should probably do some validation here
	db.query(Scheduleme.Queries.changeEmployeePassword, [newpassword, id, oldpassword], cb);

}
exports.login = Employee.login;


