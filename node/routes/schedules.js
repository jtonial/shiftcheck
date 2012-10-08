var models = require('../models/models.js')
	, crypto = require('crypto')
	;

calcHash = function (val) {
	var shasum = crypto.createHash('sha1')
		, salt = 'schedule12101991';

	return shasum.update(val+salt).digest('hex');
}

exports.loadDate = function(req, res){
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
				res.statusCode = 499;
			}
			res.end();
		});
	} else {
		res.statusCode = 403; //Unauthorized access?
		res.end();
		console.log('Unauthorized access attempt: loadDate schedule');
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
		var employer = req.body.employer;
		var date = ISODate(req.body.date);

		//I have no idea if this is going to work... I will have to check after I html2jade the html files and have the ability to sign in
		var shifts = new Array();

		req.body.shifts.forEach(function (x) {
			var y = new Object();
			y._id = new mongoose.Schema.ObjectId()
			y.employee = x.employee;
			y.start_time = x.start_time;
			y.end_time = x.end_time;
			y.position = x.position;
			y.upforgrabs = false;
			shifts.push(y);
		});

		var schedule = new Schedule ({
			employer: employer,
			date: date,
			creation_time:new Date(),
			shifts: shifts
		});

		schedule.save(function (err) {
			if (!err) {
				console.log('New Schedule created');
				res.statusCode = 201;
			} else { //There was an error
				console.log('There was an error creating a schedule: '+err);
				res.statusCode = 401;
			}
			res.end('Schedule - create');
		});
	} else {
		res.statusCode = 403; //Unauthorized access?
		res.end();
		console.log('Unauthorized access attempt: create schedule');
	}
};

exports.update = function(req, res) {
	console.log('Update Employee ID: '+req.params.id);
  res.send("Employee - update");
};

exports.changePassword = function(req,res){
	if (typeof req.session.employeeid != 'undefined') {//If an employer is signed in
		//Update Password
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