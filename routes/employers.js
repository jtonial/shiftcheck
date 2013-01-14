var models = require('../models/models.js')
	, crypto = require('crypto')
	;

calcHash = function (val) {
	var shasum = crypto.createHash('sha1')
		, salt = 'schedule12101991';

	return shasum.update(val+salt).digest('hex');
};
exports.bootstrap = function(req, res){
	if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
		console.log('Load EmployerID: '+req.session.employerid);
		models.Employer.findOne({ _id:req.session.employerid }, function (err, doc) {
			if (!err) {
				if (doc) {
					console.log('returning signed in employer');
					var response = {};
					response.data = (doc);

					//Fetch Schedule locations
					models.Schedule.find({employer: req.session.employerid, 'date': {$gte: Date() }, 'awaitingupload': { $exists: false } }, function (err, docs) {
						if (!err) {
							response.schedules = [];

							docs.forEach(function (x) {
								//console.log(x);
								var tmp = {};
								tmp.date = x.date;
								tmp.creation_time = x.creation_time;
								//tmp.last_modified = x.last_modified;
								tmp.url = x.image_loc;
								response.schedules.push(tmp);
							});

							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify(response));
						} else {
							console.log('Error fetching Employer: '+err);
							res.statusCode = 500;
							res.end();
						}
					});
				}
			} else {
				console.log('Error fetching Employer: '+err);
				res.statusCode = 500;
				res.end();
			}
		});
	} else {
		res.statusCode = 403; //Unauthorized access?
		res.end();
		console.log('Unauthorized access attempt: employer bootstrap');
	}
};

//This will load all employees for the given employer
exports.load = function (req, res) {
	console.log('Load Employers');
	models.Employer.find( {}, { _id:1, name:1}, function (err, docs) {
		if (!err) {
			if (docs) {
				var response = {};
				response.data = [];
				docs.forEach(function (x) {
					console.log();
					response.data.push(x);
				});
				res.statusCode = 200;
				res.write(JSON.stringify(response));
			} else {
				res.statusCode = 404;
			}
		} else {
			console.log('Error fetching Projectss: '+err);
			res.statusCode = 500;
		}
		res.end();
	});
};
exports.create = function(req, res){
	//TODO: Validation; same as client side
	
	var name = req.body.name;
	var email = req.body.email;
	var password = calcHash(req.body.password);
	var positions = req.body.positions;
	var company_email = req.body.company_email;
	var company_phone = req.body.company_phone;
	var company_address = req.body.company_address;

	//TODO: Validate email (function can be taken from another project)

	var employer = new Employer ({
		name: name,
		email: email ,
		password: password,
		positions: positions,
		company: {
			email: company_email,
			phone: company_phone,
			address: company_address
		},
		last_login:'',
		login_count:0,
		reg_time:new Date()
	});

	employer.save(function (err) {
		if (!err) {
			console.log('New Employer created');
			res.statusCode = 201;
		} else { //There was an error
			console.log('There was an error creating an employer: '+err);
			res.statusCode = 401;
		}
		res.end('Employer - create');
	});
};

/* This function can update:
	- name
	- email
	- img
	- schedule_type
	- contact_info
*/
exports.update = function(req, res) {
	console.log('Update Employer ID: '+req.params.id);
	var object = {};
	object = req.body;
	var numErrors = 0;
	if (typeof req.body.name != 'undefined') {
		if (typeof req.body.name == 'string') {
			object.name = req.body.name;
		} else {
			numErrors+=1;
		}
	}
	if (typeof req.body.email != 'undefined') {
		if (typeof req.body.email == 'string') {
			object.email = req.body.email;
		} else {
			numErrors+=1;
		}
	}
	if (typeof req.body.img != 'undefined') {
		if (typeof req.body.img == 'string') {
			object.img = req.body.img;
		} else {
			numErrors+=1;
		}
	}
	if (typeof req.body.schedule_type != 'undefined') {
		if (typeof req.body.schedule_type == 'string' &&
			(req.body.schedule_type == 'daily' ||
			req.body.schedule_type == 'weekly' ||
			req.body.schedule_type == 'monthly')) {
			object.schedule_type = req.body.schedule_type;
		} else {
			numErrors+=1;
		}
	}
	//Contact info validation
	if (typeof req.body.contact_info != 'undefined') {
		if (typeof req.body.contact_info.email != 'undefined') {
			if (typeof req.body.contact_info.email == 'string') {
				if (typeof object.contact_info == 'undefined') {
					object.contact_info = {};
				}
				object.contact_info.email = req.body.contact_info.email;
			} else {
				numErrors+=1;
			}
		}
		if (typeof req.body.contact_info.phone != 'undefined') {
			if (typeof req.body.contact_info.phone == 'string') {
				if (typeof object.contact_info == 'undefined') {
					object.contact_info = {};
				}
				object.contact_info.phone = req.body.contact_info.phone;
			} else {
				numErrors+=1;
			}
		}
		if (typeof req.body.contact_info.address != 'undefined') {
			if (typeof req.body.contact_info.address == 'string') {
				if (typeof object.contact_info == 'undefined') {
					object.contact_info = {};
				}
				object.contact_info.address = req.body.contact_info.address;
			} else {
				numErrors+=1;
			}
		}
	}

	if (numErrors === 0) {
		models.Employer.update( { _id:req.session.employerid },
			object , false, false, function(err) {
				if (!err) {
					res.statusCode = 201;
				} else {
					res.statusCode = 500;
					console.log('Error creating new positions: '+err);
				}
				res.end();
			});
	} else {
		res.statusCode = 400;
		res.end();
	}
};

exports.getPositions = function(req, res){
	//Get positions of the employer
};
exports.createPosition = function(req, res) {
	//Add a position(s) from the req.body to the positions array
	var new_positions = req.body.positions;

	models.Employer.update( { _id:req.session.employerid },
		{$addToSet: {positions: { $each: new_positions }}}, false, false, function(err) {
			if (!err) {
				res.statusCode = 201;
			} else {
				res.statusCode = 500;
				console.log('Error creating new positions: '+err);
			}
			res.end();
		});
};
exports.removePosition = function(req, res) {
	//Remove a position(s) from the req.body from the positions array (if the exist)
	var remove_positions = req.body.positions;

	models.Employer.update( { _id:req.session.employerid },
		{$pullAll: {positions: remove_positions}}, false, false, function(err) {
			if (!err) {
				res.statusCode = 200;
			} else {
				res.statusCode = 500;
				console.log('Error removing positions: '+err);
			}
			res.end();
		});

	//TODO: Remove the positions from any employee of the employer
};
exports.changePassword = function(req,res){
	if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
		//Update Password
		var oldPassword = calcHash(req.body.oldpassword);
		var newPassword = calcHash(req.body.newpassword);
		models.Employer.update( { _id:req.session.employerid, password:oldPassword }, { password:newPassword }, { multi:false }, function(err, numAffected) {
			if (!err) {
				if (numAffected) {
					//Note that I am making the assumption that if there is no error, than a row was updated (not checking numAffected)
					console.log('Employer '+req.session.employerid+' password updated');
					res.statusCode = 200;
					res.end("Password Updated");
				} else {
					res.statusCode = 400;
					res.end();
				}
			} else { //An error
				render.code500(req, res);
			}
		});
	} else {
		render.code403(req, res);
		console.log('Unauthorized access attempt: create employee');
	}
};
exports.deleteEmployer = function(req, res) {
	if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
		//Post all of the employees shifts as up for grabs, and then remove him from the system
		console.log('Delete EmployerID: '+req.params.id);
		res.end("Employer - delete: Inactive at current time");
	} else {
		render.code403(req, res);
		console.log('Unauthorized access attempt: delete employee');
	}
};
