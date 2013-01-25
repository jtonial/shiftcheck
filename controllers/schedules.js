var Scheduleme = require('../helpers/global');

var crypto = require('crypto')
	;

//Have to test this

//Shortcut Scheduleme.debug maybe, or use winston (probably has environment stuff built in)
//Add a log statement to the top of each included file; would give a good output
	//and I can see when they're actually being loaded

exports.loadDate = function(req, res){
	if (typeof req.session.employer_id != 'undefined') {//If an employer is signed in
		console.log('Load Schedule: Employer: '+req.session.employer_id+' Date: '+req.params.date);

		//This will have to be changed to accomodate different scehdule lengths (ie, 01-15-2013 will match a schedule of length and date 01-12-2013)
		//I feel like this is unstable, but I will use it for now
			//I also need to fetch schedules in which the given date is in the week/twoWeek/month

		var input = {
			id 		: req.session.employer_id,
			date 	: req.params.date
		}

		Scheduleme.Models.Schedule.getByEmployerDate(input, function (obj) {

			err 		= obj.err;
			row 		= obj.row;
			response 	= typeof obj.response != 'undefined' ? obj.response : {};

			if (err) {
				response.statusCode = 500;
				response.message = err.code;
				console.log(err.code);
			} else {
				if (row) {
					response.statusCode = 200;
					response.data = row;
				} else {
					response.statusCode = 404;
					response.message = 'No schedule found for that date';
				}
			}
			Scheduleme.Helpers.Render.code(req.xhr, res, response);
		});

		//delete d; //Clear reference to d //jsHint told me this was bad...
	} else {
		Scheduleme.Helpers.Render.code403(req,res);
		console.log('Unauthorized access attempt: loadDate schedule');
	}
};

exports.load = function (req, res) {
	if (typeof req.session.employer_id !== 'undefined' || typeof req.session.employee_id !== 'undefined') {
		var input = {
			id : typeof req.session.employer_id !== 'undefined' ? req.session.employer_id : req.session.employee_id,

		}

		console.log('Load Schedule for EmployerID: '+input.id);

		Scheduleme.Models.Schedule.getByEmployer(input, 
			function (obj) {
				Scheduleme.Helpers.Render.code(req.xhr, res, obj)
			});
	} else {
		response = {
			statusCode : 403
		}

		Scheduleme.Helpers.Render.code(req.xhr, res, response);

		console.log('Unauthorized access attempt: load schedules');
	}
};

exports.clientUpload = function(req, res) {

	var sendCreds = function (id, key) {
		var createS3Policy;
		var s3Signature;
		var _date, _s3Policy;
		_date = new Date();
		s3Policy = {
			"expiration": "" + (_date.getFullYear()) + "-" + (_date.getMonth() + 1) + "-" + (_date.getDate()) + "T" + (_date.getHours()+12) + ":" + (_date.getMinutes()) + ":" + (_date.getSeconds()) + "Z",
			"conditions": [
				{ "bucket": "nrmitchi.schedules" },
				[ "starts-with", "$key", ""],
				{ "acl": "public-read" },
				//{ "success_action_redirect": "http://schedule-me.herokuapp.com/verifyUpload?x="+id },
				//If I make this redirect a hash, I can use a route to trigger an ajax ping to verifyUpload, thus not leaving the page
					//Note: I  tried this and s3 returned a 204 instead of a redirect to the hash
				{ "redirect": "http://schedule-me.herokuapp.com/verifyUpload?x="+id },
				["content-length-range", 0, 2147483648],
				["eq", "$Content-Type", 'application/pdf']
			]
		};
		var s3PolicyBase64 = new Buffer( JSON.stringify( s3Policy ) ).toString( 'base64' );

		var s3Credentials = {
			key: key,
			acl: 'public-read',
			s3PolicyBase64: s3PolicyBase64,
			s3Signature: crypto.createHmac( 'sha1', process.env.AWS_SECRET_ACCESS_KEY || 'I1wqnnTDmK3KyfevxK7y4DD053gcLgGGh/kPTvBr' ).update( s3PolicyBase64 ).digest( 'base64' ),
			s3Key: process.env.AWS_ACCESS_KEY_ID || 'AKIAIKTL23OZ4ILD5TWQ',
			s3Redirect: "http://schedule-me.herokuapp.com/verifyUpload?x="+id, 
			s3Policy: s3Policy
		};
		res.end(JSON.stringify(s3Credentials));
	};

	var file_name = new Date().getTime().toString(); //Use the current time as key for testing
	var rand = 'dflkasjceo;ajsclkajs'; //Random string
	file_name = crypto.createHmac('sha1', rand).update(file_name).digest('hex')+'.pdf';

	console.log(JSON.stringify(req.body));

	//Validate schedule type; else default to daily
	console.log('Uploading new schedule: Day: '+req.body.date+' Type: '+req.body.type);
	var type = 'day';
	if (req.body.type == 'week' ||
		req.body.type == 'twoweek' ||
		req.body.type == 'month') {
		type = req.body.type;
	}
	var date;
	var tmpDate = new Date(req.body.date);
	if (type == 'day') {
		date = tmpDate;
	} else if (type == 'week') {
		date = tmpDate;
	} else if (type == 'twoweek') {
		date = tmpDate;
	} else if (type == 'month') {
		date = new Date(tmpDate.getFullYear() - tmpDate.getMonth());
	}

	var schedule = Scheduleme.Models.Schedule.new({
		employer_id: req.session.employer_id,
		date: new Date(req.body.date),
		type: type,
		creation_time: Date(),
		image_loc: file_name,
		shifts: []//shifts
	});

	schedule.save(function (err, result) {
		if (!err) {
			console.log('New Schedule created: id: '+result.insertId);
			sendCreds(result.insertId, file_name);
		} else { //There was an error
			console.log('There was an error creating a schedule: '+err);
			Scheduleme.Helpers.Render.code500(req,res);
		}
	});
};

exports.verifyUpload = function (req, res) {

	var id = req.query.x;

	if (typeof id != 'undefined') {
		console.log('Verifying schedule: '+id);
		//This update hangs and i'm not sure why.... I feel like it may be because it doens't have a db connection but I cant seem to figure it out
		Scheduleme.Models.Schedule.verifyUpload(id, function (obj) {

			err 	= obj.err;
			result 	= obj.result;
			
			console.log('update complete of schedule: '+id);
			if (err) {
				console.log('Error updating awaiting upload status: '+err);
				Scheduleme.Helpers.Render.uploadVerifiedFailed(req, res);
			} else {
				if (result.affectedRows) {
					Scheduleme.Helpers.Render.uploadVerified(req, res);
				} else {
					//Nothing changed... for now just do the same
					Scheduleme.Helpers.Render.uploadVerified(req, res);
				}
			}
		});
	} else {
		//Do nothing, no parameter supplied
		console.log('No id provided');
		Scheduleme.Helpers.Render.uploadVerifiedBadReq(req, res);
	}
};
//This seems to work for uploading a pdf and adding a schedule to a database
exports.upload = function(req,res){ //Used to process a file containing a schedule
	//Commented for easing testing
	//if (typeof req.session.employerid != 'undefined') {
		//Determine the type of file
		//Parse the file based on the given type

		//For MVP we only use PDFs
		//console.log(JSON.stringify(req.files));
		if (typeof req.files.schedule != 'undefined') {
			// TODO: validate the upload file

			var knox = require('knox');
			var s32 = require('s3');

			var s3 = knox.createClient({
				key: process.env.AWS_ACCESS_KEY_ID || 'AKIAIKTL23OZ4ILD5TWQ',
				secret: process.env.AWS_SECRET_ACCESS_KEY || 'I1wqnnTDmK3KyfevxK7y4DD053gcLgGGh',
				bucket: process.env.S3_BUCKET_NAME || /*'schedule-me'*/ 'nrmitchi.schedules',
				secure:false
			});

			var file_name = req.session.employerid+'.'+(new Date()).getTime()+'.'+req.files.schedule.name;
			console.log('Name: '+file_name);

			var s3Headers = {
				'Content-Type': 'application/pdf',
				'Content-Length': req.files.schedule.length,
				'x-amz-acl': 'public-read'
			};

			request = s3.putFile(req.files.schedule.path, s3Headers, function(err, result) {
				if (typeof result != 'undefined') {
					if (200 == result.statusCode) {
						console.log('Uploaded to Amazon S3');
					} else {
						console.log('Failed to upload file to Amazon S3: '+result.statusCode);
						res.statusCode = 500;
						res.end();
					}
				} else {
					console.log ('result undefined again... wtf');
				}
			}).on('error', function (s3response) {
				console.log('There was an error saving a schedule image: '+err);
				res.statusCode = 500;
			}).on('response', function (s3response) {
				console.log('S3Response: '+s3response.statusCode+ ': '+s3response.url);
				if (s3response.statusCode === 200) {
					console.log('return status is 200');
					console.log('Schedule Date: '+req.body.date);
					var schedule = new models.Schedule ({
						employer: req.session.employerid,
						date: {
							date: new Date(req.body.date),
							lenght: req.body.length || 1
						},
						creation_time: Date(),
						image_loc: file_name,
						shifts: []//shifts
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
			}).on('progress', function (resp) {
				console.log('Progress: '+resp.written+': '+resp.total+': '+resp.percent);
			});
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
};