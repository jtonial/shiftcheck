var models = require('../models/models.js')
	, crypto = require('crypto')
	;

calcHash = function (val) {
	var shasum = crypto.createHash('sha1')
		, salt = 'schedule12101991';

	return shasum.update(val+salt).digest('hex');
}

exports.bootstrap = function(req, res){
	if (typeof req.session.employeeid != 'undefined') {//If an employer is signed in
		console.log('Load EmployeeID: '+req.session.employeeid);
		models.Employee.findOne({ _id:req.session.employeeid }, function (err, doc) {
			if (!err) {
				if (doc) {
					var response = new Object();
					//Note: I cannot just response = doc. If I do this I cannot seem to add to the response object
					response.email = doc.email;
					response.first_name = doc.first_name;
					response.last_name = doc.last_name;

					//Fetch Schedule locations
					models.Schedule.find({employer: req.session.employer, 'date': {$gte: Date() }, 'awaitingupload': { $exists: false } }, function (err, docs) {
						if (!err) {
							response.schedules = new Array();

							docs.forEach(function (x) {
								//console.log(x);
								var tmp = new Object();
								tmp.date = x.date;
								tmp.creation_time = x.creation_time;
								//tmp.last_modified = x.last_modified;
								tmp.url = x.image_loc;
								response.schedules.push(tmp);
							});

							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify(response));
						} else {
							console.log('Error fetching Employee: '+err);
							res.statusCode = 500;
							res.end();
						}
					});
				}
			} else {
				console.log('Error fetching Employee: '+err);
				res.statusCode = 500;
				res.end();
			}
		});
	} else {
		res.statusCode = 403; //Unauthorized access?
		console.log('Unauthorized access attempt: employee bootstrap');
		res.end();
	}
};

exports.loadOne = function(req, res){
	if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
		console.log('Load EmployeeID: '+req.params.id);
		models.Employee.findOne({ _id: req.params.id, employerid: req.session.employerid }, function (err, docs) {
			if (!err) {
				console.log('returning apis');
				var response = new Object();
				response.data = new Array();
				docs.forEach(function (x) {
					response.data.push(x);
				});
				res.statusCode = 200;
				res.write(JSON.stringify(response));
			} else {
				console.log('Error fetching Project: '+err);
				res.statusCode = 500;
			}
			res.end();
		});
	} else {
		res.statusCode = 403; //Unauthorized access?
		res.end();
		console.log('Unauthorized access attempt: loadOne employee');
	}
};

//This will load all employees for the given employer
exports.load = function (req, res) {
	if (typeof req.session.employerid != 'undefined') {//If an employer is signed in

		console.log('Load Employees for EmployerID: '+req.session.employerid);
		models.Employee.find({ employerid: req.session.employerid }, function (err, docs) {
			if (!err && docs) {
				var response = new Object();
				response.data = new Array();
				docs.forEach(function (x) {
					console.log();
					response.data.push(x);
				});
				res.statusCode = 200;
				res.write(JSON.stringify(response));
			} else {
				console.log('Error fetching Projectss: '+err);
				res.statusCode = 499;
			}
			res.end();
		});
	} else {
		res.statusCode = 403; //Unauthorized access?
		res.end();
		console.log('Unauthorized access attempt: load employees');
	}
};
exports.create = function(req, res){
	if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
		var email = req.body.email;
		var password = calcHash(req.body.password);
		var first_name = req.body.first_name;
		var last_name = req.body.last_name;
		var employer = req.session.employerid; //Current employer
		var positions = req.body.positions;

		//TODO: Validate email (can take function from another project)

		var employee = new Employee ({
			email: email ,
			password: password,
			first_name: first_name,
			last_name: last_name,
			employer: company,
			positions: positions,
			last_login:'',
			login_count:0,
			reg_time:new Date()
		});

		employee.save(function (err) {
			if (!err) {
				console.log('New Employee created');
				res.statusCode = 201;
			} else { //There was an error
				console.log('There was an error creating an employee: '+err);
				res.statusCode = 401;
			}
			res.end('Employee - create');
		});
	} else {
		res.statusCode = 403; //Unauthorized access?
		res.end();
		console.log('Unauthorized access attempt: create employee');
	}
};

exports.update = function(req, res) {
	console.log('Update Employee ID: '+req.params.id);
	res.send("Employee - update");
};

exports.addPosition = function(req, res) {
	//Add a position to an employee (given by req.params.eid)
	var new_positions = req.body.positions;

	//TODO: Verify that passed positions exist in the employer

	models.Employee.update({ _id:req.params.eid, employer:req.session.employerid },
			{$addToSet: {positions: { $each: new_positions }}}, false, false, function (err) {
				if (!err) {
					res.statusCode = 201;
				} else {
					res.statusCode = 500;
					console.log('there was an error: '+err);
				}
				res.end();
			});
};

exports.changePassword = function(req,res){
	if (typeof req.session.employeeid != 'undefined') {//If an employer is signed in
		//Update Password
		var oldPassword = req.body.oldpassword;
		var newPassword = req.body.newpassword;

		//TODO: Validate new password

		models.Employee.update( { _id:req.session.employeeid, password:oldPassword }, { password:newpassword }, { multi:false }, function(err, numAffected) {
			if (!err) {
				//Note that I am making the assumption that if there is no error, than a row was updated (not checking numAffected)
				console.log('Employee '+req.session.employeeid+' password updated');
				res.statusCode = 200;
				res.end("Password Updated");
			} else { //An error
				res.statusCode = 499;
				res.end('There was an error.. not sure what i should do here');
			}
		});
	} else {
		res.statusCode = 403; //Unauthorized access?
		res.end();
		console.log('Unauthorized access attempt: create employee');
	}
}
exports.delete = function(req, res) {
	if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
		//Post all of the employees shifts as up for grabs, and then remove him from the system
		console.log('Delete  ID: '+req.params.id);
	  res.send("projects - delete");
	} else {
		res.statusCode = 403; //Unauthorized access?
		res.end();
		console.log('Unauthorized access attempt: create employee');
	}
};
