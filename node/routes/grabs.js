var models = require('../models/models.js')
	, crypto = require('crypto')
	;

calcHash = function (val) {
	var shasum = crypto.createHash('sha1')
		, salt = 'schedule12101991';

	return shasum.update(val+salt).digest('hex');
}

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

exports.addRequest = function(req, res) {
	console.log('Update Employee ID: '+req.params.id);
  res.send("Employee - update");
};

exports.getRequests = function(req,res){
	if (typeof req.session.employeeid != 'undefined') {//If an employer is signed in
		//Update Password
	} else {
		res.statusCode = 403; //Unauthorized access?
		res.end();
		console.log('Unauthorized access attempt: create employee');
	}
}
exports.respondRequest = function(req,res){

}
exports.deleteRequest = function(req, res) {
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
