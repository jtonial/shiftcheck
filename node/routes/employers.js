var models = require('../models/models.js')
	, crypto = require('crypto')
	;

calcHash = function (val) {
	var shasum = crypto.createHash('sha1')
		, salt = 'schedule12101991';

	return shasum.update(val+salt).digest('hex');
}

exports.loadMe = function(req, res){
	if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
		console.log('Load EmployerID: '+req.session.employerid);
		models.Employer.findOne({ _id:req.session.employerid }, function (err, doc) {
			if (!err) {
				console.log('returning signed in employer');
				var response = new Object();
				response.data = (doc);
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
		console.log('Unauthorized access attempt: loadOne employee');
	}
};

//This will load all employees for the given employer
exports.load = function (req, res) {
	console.log('Load Employers');
	models.Employer.find( {}, { _id:1, name:1}, function (err, docs) {
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

exports.update = function(req, res) {
	console.log('Update Employer ID: '+req.params.id);
  res.send("Employer - update");
};

exports.getPositions = function(req, res){
	//Get positions of the employer
};
exports.createPosition = function(req, res) {
	//Add a position(s) from the req.body to the positions array
};
exports.removePosition = function(req, res) {
	//Remove a position(s) from the req.body from the positions array (if the exist)
};
exports.changePassword = function(req,res){
	if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
		//Update Password
		var oldPassword = req.body.oldpassword;
		var newPassword = req.body.newpassword;
		models.Employer.update( { _id:req.session.employerid, password:oldPassword }, { password:newpassword }, { multi:false }, function(err, numAffected) {
			if (!err) {
				//Note that I am making the assumption that if there is no error, than a row was updated (not checking numAffected)
				console.log('Employer '+req.session.employerid+' password updated');
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
		console.log('Delete EmployerID: '+req.params.id);
	  res.send("Employer - delete");
	} else {
		res.statusCode = 403; //Unauthorized access?
		res.end();
		console.log('Unauthorized access attempt: create employee');
	}
};
