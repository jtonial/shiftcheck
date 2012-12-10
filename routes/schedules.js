var models = require('../models/models.js')
	, mongoose = require('mongoose')
	, crypto = require('crypto')
	, fs = require('fs')
	;

calcHash = function (val) {
	var shasum = crypto.createHash('sha1')
		, salt = 'schedule12101991';

	return shasum.update(val+salt).digest('hex');
}

exports.loadDate = function(req, res){
	if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
		console.log('Load Schedule: '+req.params.date);
		models.Schedule.findOne({ date: req.params.date, employerid: req.session.employerid }, function (doc) {
			if (!err) {
				res.statusCode = 200;
				res.write(doc);
			} else {
				console.log('Error fetching Project: '+err);
				res.statusCode = 499;
			}
			res.end();
		});
	} else {
		res.statusCode = 403;
		res.end();
		console.log('Unauthorized access attempt: loadDate schedule');
	}
};

exports.load = function (req, res) {
	if (typeof req.session.employerid != 'undefined') {
		//Load schedule for the signed in employer
		console.log('Load Schedule for EmployerID: '+req.session.employerid);
		//Note this currently returns all schedules; it should only return from current date forward
		models.Schedule.find({ employerid: req.session.employerid }, function (err, docs) {
			if (!err) {
				if (docs) {
					var response = new Object();
					response.data = new Array();
					docs.forEach(function (x) {
						console.log();
						response.data.push(x);
					});
					res.statusCode = 200;
					res.write(JSON.stringify(response));
				} else {
					//No Schedules present
				}
			} else {
				console.log('Error fetching Projects: '+err);
				res.statusCode = 500;
			}
			res.end();
		});
	} else if (typeof req.session.employeeid != 'undefined') {
		//Load schedule for the signed in employee
		models.Schedule.find( {employeeid: req.session.employeeid}, function (err, docs) {
			if (!err) {
				docs.forEach
			} else {
				console.log('Error fetching Projects: '+err);
				res.statusCode = 500;
				res.end();//Send appropriate error
			}
		});
	} else {
		res.statusCode = 403; //Unauthorized access?
		res.end();
		console.log('Unauthorized access attempt: load employees');
	}
};
exports.clientUpload = function(req, res) {

	var sendCreds = function (id) {
		var createS3Policy;
		var s3Signature;
		var s3Credentials;

		var key = new Date().getTime().toString(); //Use the current time as key for testing
		var rand = 'dflkasjceo;ajsclkajs'; //Random string
		key = crypto.createHmac('sha1', rand).update(key).digest('hex')+'.pdf';

		var s3PolicyBase64, _date, _s3Policy;
		_date = new Date();
		s3Policy = {
			"expiration": "" + (_date.getFullYear()) + "-" + (_date.getMonth() + 1) + "-" + (_date.getDate()) + "T" + (_date.getHours()+12) + ":" + (_date.getMinutes()) + ":" + (_date.getSeconds()) + "Z",
			"conditions": [
				{ "bucket": "nrmitchi.schedules" }, 
				//["starts-with", "$Content-Disposition", ""], 
				["starts-with", "$key", ""], 
				{ "acl": "public-read" },
				//{ "success_action_redirect": "http://schedule-me.herokuapp.com/verifyUpload?x="+id },
				["content-length-range", 0, 2147483648],
				["eq", "$Content-Type", 'application/pdf']
			]
		};
		var s3PolicyBase64 = new Buffer( JSON.stringify( s3Policy ) ).toString( 'base64' ),

		s3Credentials = {
			key: key,
			acl: 'public-read',
			s3PolicyBase64: s3PolicyBase64,
			s3Signature: crypto.createHmac( 'sha1', process.env.AWS_SECRET_ACCESS_KEY || 'I1wqnnTDmK3KyfevxK7y4DD053gcLgGGh/kPTvBr' ).update( s3PolicyBase64 ).digest( 'base64' ),
			s3Key: process.env.AWS_ACCESS_KEY_ID || 'AKIAIKTL23OZ4ILD5TWQ',
			s3Redirect: "http://schedule-me.herokuapp.com/verifyUpload?x="+id, 
			s3Policy: s3Policy
		}
		res.end(JSON.stringify(s3Credentials));
	}

	var file_name = req.session.employerid+'.'+(new Date()).getTime()+'.'+req.files.schedule.name;

	var schedule = new models.Schedule ({
		employer: req.session.employerid || mongoose.Types.ObjectId('999999999999999999999999'),
		date: new Date(req.body.date),
		creation_time: Date(),
		image_loc: file_name,
		shifts: new Array(),//shifts
		awaitingupload: true
	});

	schedule.save(function (err, s) {
		if (!err) {
			console.log('New Schedule created: id: '+s.id);
			sendCreds(s.id);
		} else { //There was an error
			console.log('There was an error creating a schedule: '+err);
			res.statusCode = 500;
			res.end();
		}
	});
};
exports.verifyUpload = function (req, res) {
	if (typeof req.query.x != 'undefined' && req.query.x.length == 24) {
		console.log('Verifying schedule: '+req.query.x);
		//This update hangs and i'm not sure why.... I feel like it may be because it doens't have a db connection but I cant seem to figure it out
		models.Schedule.update( { _id:mongoose.Types.ObjectId(req.query.x) }, { $unset : { "awaitingupload" : 1 } }, function (err) {
			console.log('update complete');
			if (err) {
				console.log('Error updating awaiting upload status: '+err);
			}
			res.end();
		});
	} else {
		//Do nothing, no parameter supplied
		console.log('No id provided or invalid id');
		res.statusCode = 400;
		res.end();
	}
}
//This seems to work for uploading a pdf and adding a schedule to a database
exports.upload = function(req,res){ //Used to process a file containing a schedule
	//Commented for easing testing
	//if (typeof req.session.employerid != 'undefined') {
		//Determine the type of file
		//Parse the file based on the given type

		//For MVP we only use PDFs
		if (typeof req.files.schedule != 'undefined') {
			// TODO: validate the upload file

			var knox = require('knox');

			var s3 = knox.createClient({
				key: process.env.AWS_ACCESS_KEY_ID || 'AKIAIKTL23OZ4ILD5TWQ',
				secret: process.env.AWS_SECRET_ACCESS_KEY || 'I1wqnnTDmK3KyfevxK7y4DD053gcLgGGh',
				bucket: process.env.S3_BUCKET_NAME || 'nrmitchi.schedules'
			});

			var file_name = req.session.employerid+'.'+(new Date()).getTime()+'.'+req.files.schedule.name;

			//fs.createReadStream(req.files.schedule.path, function (err, data) {
			//	if (!err) {
					var s3Headers = {
						'Content-Type': 'application/pdf',
						'Content-Length': req.files.schedule.length,
						'x-amz-acl': 'public-read'
					};

					request = s3.putFile(req.files.schedule.path, file_name, s3Headers, function(err, result) {
						if (200 == result.statusCode) { console.log('Uploaded to Amazon S3'); }
						else { console.log('Failed to upload file to Amazon S3: '+result.statusCode); }
					});

					/*request.on('error', function (s3response) {
						console.log('There was an error saving a schedule image: '+err);
						res.statusCode = 500;
					}).on('response', function (s3response) {
						console.log('S3Response: '+s3response);
						if (s3response.statusCode === 200) {
							console.log('return status is 200');
							console.log('Schedule Date: '+req.body.date);
							var schedule = new models.Schedule ({
								employer: req.session.employerid,
								date: new Date(req.body.date),
								creation_time: Date(),
								image_loc: file_name,
								shifts: new Array()//shifts
							});

							schedule.save(function (err) {
								if (!err) {
									console.log('New Schedule created');
									res.statusCode = 201;
								} else { //There was an error
									console.log('There was an error creating a schedule: '+err);
									res.statusCode = 500;
								}
								res.end('Schedule - create');
							});

							res.statusCode = 200;
						} else {
							res.statusCode = 500;
						}
						res.end();
					});*/
				/*} else {
					console.log('Error reading uploaded file');
					res.statusCode = 500;
				}*/
				res.end();
			//});
			/*fs.readFile(req.files.schedule.path, function (err, data) {
				var file_loc = req.session.employerid+'.'+(new Date()).getTime()+'.'+req.files.schedule.name;
				var newPath = __dirname + "/../schedules/"+file_loc;
				fs.writeFile(newPath, data, function (err) {
					if (!err) {

						var shifts = new Array(); //Not used in MVP

						// Not used in MVP
						// req.body.shifts.forEach(function (x) {
						// 	var y = new Object();
						// 	y._id = new mongoose.Schema.ObjectId()
						// 	y.employee = x.employee;
						// 	y.start_time = x.start_time;
						// 	y.end_time = x.end_time;
						// 	y.position = x.position;
						// 	y.upforgrabs = false;
						// 	shifts.push(y);
						// });
						console.log('Schedule Date: '+req.body.date);
						var schedule = new models.Schedule ({
							employer: req.session.employerid,
							date: new Date(req.body.date),
							creation_time: Date(),
							image_loc: file_loc,
							shifts: shifts
						});


						schedule.save(function (err) {
							if (!err) {
								console.log('New Schedule created');
								res.statusCode = 201;
							} else { //There was an error
								console.log('There was an error creating a schedule: '+err);
								res.statusCode = 500;
							}
							res.end('Schedule - create');
						});

						res.statusCode = 200;
					}  else {
						console.log('There was an error saving a schedule image: '+err);
						res.statusCode = 500;
						console.log(err);
					}
					res.end();
				});
			}); */
		} else {
			res.statusCode = 400;
			res.end('No schedule provided');
		}
	/*} else {
		res.statusCode = 403;
		res.end();
	}*/
}