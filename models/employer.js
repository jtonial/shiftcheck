var Scheduleme = require('../helpers/global');
var db = require('../db/dbconnection');

var _ = require('underscore');

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
		var email = req.body.email;
		if (typeof email != 'undefined' && email != '' && typeof req.body.password != 'undefined') {
			var password = req.body.password;
			//console.log('Email: '+email+' Password: '+password);
			//Search object for account lookup
			var where = new Object();
			var loginQuery='';
			if (Scheduleme.Helpers.is_email(email)) {
				console.log('is an email');
				loginQuery = 'SELECT employer_id, password, salt, name, email, username, contact_email, contact_phone, contact_address FROM employers WHERE email=? LIMIT 1';
				where.email = email;
			} else { //is username
				where.username = email;
				loginQuery = 'SELECT employer_id, password, salt, name, email, username, contact_email, contact_phone, contact_address FROM employers WHERE username=? LIMIT 1';
			}

			var response = Object();
			response.statusCode = 400; //This is set for the case when no records are returned
			db.query(loginQuery, [email], function (err, row) {
				if (err) {
					response.statusCode = 500;
					response.message = err.code;
					console.log(err.code);
					Scheduleme.Render.code(req.xhr, res, response);
				} else {
					if (row[0]) {
						console.log(Scheduleme.Helpers.calcHash(password, row[0].salt));
						if ( Scheduleme.Helpers.calcHash(password, row[0].salt) == row[0].password ) {
							req.session.employer_id = row[0].employer_id;
							req.session.email 		= row[0].email;
							req.session.username 	= row[0].username;

							response.statusCode = 200;
							Scheduleme.Render.code(req.xhr, res, response);

							db.query(Scheduleme.Queries.updateEmployerLogin, [req.session.employer_id], function (err, result) {
								if (err) {
									console.log('ERROR:: Updating employer login: '+err);
								}
							})
							
							var trackingInput = {
								type 		: 'employer',
								id 			: row[0].employer_id,
								ip 			: Scheduleme.Helpers.getClientIp(req),
								statusCode	: response.statusCode
							};
							Scheduleme.Tracking.trackLogin(trackingInput);
						} else {
							Scheduleme.Logger.info("Failed login attempt for employer "+row[0].employer_id)
							response.statusCode = 400;
							Scheduleme.Render.code(req.xhr, res, response);	
						}
					} else {
						response.statusCode = 400;
						Scheduleme.Render.code(req.xhr, res, response);
					}
				}
			});
		} else {
			var response = Object();
			response.statusCode = 400;
			response.message = 'Email is missing or empty';
			Scheduleme.Render.code(req.xhr, res, response);
		}
	}
};

exports.new = function (object) {
	return Object.create(Employee);
}

exports.create = function (obj, cb) {
	salt      = Scheduleme.Helpers.generateSalt();

	name 		  = obj.name;
	email 		= obj.email;
	username 	= obj.username;
	pass 		  = Scheduleme.Helpers.calcHash(obj.password, salt);
	c_email 	= obj.contact_email;
	c_phone 	= obj.contact_phone;
	c_add 		= obj.contact_address;

	db.query(Scheduleme.Queries.insertEmployer, [name, email, username, pass, salt, c_email, c_phone, c_add], cb)
};
//Export static methods
//I should not do two callbacks here... I should leave this up to the controller to handle
exports.fetch = function (obj, cb) {
	//Note: this is queries['selectEmployer']; I need to globalize this

	if (typeof obj.id == 'undefined') {
		//Scheduleme.Render.code(req)
		console.log('No id; Model.Employer.fetch');
	}

	var id = obj.id;

	db.query(Scheduleme.Queries.selectEmployer, [id], function (err, row) {
		
		response = {};

		if (err) {
			console.log(err.code);
			cb(err, response);
		} else {
			response = row[0];
		}

		cb(err, response);
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
	db.query(Scheduleme.Queries.changeEmployerPassword, [newpassword, id, oldpassword], cb);

}

exports.login = Employer.login;