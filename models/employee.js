var Employee = {

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
				loginQuery = 'SELECT employee_id, name, email, username, first_name, last_name FROM employees WHERE email=? AND password=? LIMIT 1';
				where.email = email;
			} else { //is username
				where.username = email;
				loginQuery = 'SELECT employee_id, name, email, username, contact_email, contact_phone, contact_address FROM employees WHERE username=? AND password=? LIMIT 1';
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
						req.session.employee_id = row[0].employee_id;
						req.session.email = row[0].email;
						req.session.username = row[0].username;
						req.session.first_name = row[0].first_name;
						req.session.last_name = row[0].last_name;
						req.session.employer = row[0].employer_id;

						console.log('Session: '+JSON.stringify(req.session));

						response.statusCode = 200;
						Scheduleme.Helpers.Render.code(req.xhr, res, response);

						console.log('login success');

						db.query("UPDATE employees SET login_count=login_count+1, last_login=NOW() WHERE employee_id=?", [req.session.uid], function (err, numAffected) {
							if (err) {
								console.log('ERROR:: Updating employer login: '+err);
							}
						})
						//Track login

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
	},
};

exports.new = function (object) {
	return Object.create(Employee);
}

//Export static methods
exports.login = Employee.login;