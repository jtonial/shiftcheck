var Scheduleme = require('../helpers/global');
var db = require('../db/dbconnection');

var mysql = require('mysql');
var connection = mysql.createConnection({});

//Note: Dates are UTCified going into db, and unUTFified when fetching for schedules created from local and served to staging/prod

var Schedule = {

	data: {

	},
	validate: function () {

	},
	UTCify: function (date) {
		return new Date(date.getTime() + date.getTimezoneOffset()*60000);
	},
	unUTCify: function (date) {
		return new Date(date.getTime() - date.getTimezoneOffset()*60000);
	},
	generateUpdateQuery: function () {
		var sets = [];
		var vals = [];
		for (var key in this.data) {
			sets.push(key+'=');
			vals.push(this.data[key]);
		}
		var returnObject = {
			queryString : 'UPDATE schedules SET '+sets.join()+' WHERE schedule_id='+this.id,
			values		: vals
		}

		return returnObject;
	},
	generateInsertQuery: function () {
		var returnObject = {
			queryString : 'INSERT INTO schedules (employer_id, date, type, creation_time, image_loc, timezone) VALUES (?,?,?,NOW(),?,?)',
			values		: [this.data.employer_id, this.data.date, this.data.type, this.data.image_loc, this.data.timezone]
		}

		return returnObject;
	},
	save : function (cb) {
		if (Scheduleme.Config.debug) Scheduleme.Logger.info('Saving Schedule');

		_this = this;

		if (typeof this.id == 'undefined') { //Create
			_this = this;
			var obj = this.generateInsertQuery();

			if (Scheduleme.Config.debug) Scheduleme.Logger.info('Query object: '+JSON.stringify(obj));

			db.query(obj.queryString, obj.values, function (err, result) {
				if (!err) {
					//not method forEach of undefined
					var counter = _this.data.shifts.length;
					_this.data.shifts.forEach( function (shift) {
						db.query(Scheduleme.Queries.insertShift, [result.insertId, (new Date(shift.start)).toISOString(), (new Date(shift.end)).toISOString(), shift.position, shift.employee], function (err) {
							if (err) {
								Scheduleme.Helpers.Render.code( req.xhr, res, { statusCode:500 } );
								console.log('Error: '+err);
							}
							counter--;
							if (counter == 0) {
								cb(err, result);
							}
						});
					})
				} else {
					cb(err, result);
				}
			});
		} else { //Update
			var obj = this.generateUpdateQuery();

			if (Scheduleme.Config.debug) Scheduleme.Logger.info('Query object: '+JSON.stringify(obj));

			db.query(obj.queryString, obj.values, cb);
		}

		return true;
	},
	delete : function (cb) {
		if (Scheduleme.Config.debug)Scheduleme.Logger.info('Updating Employee');
	}
};

exports.new = function (obj) {
	var tmp = Object.create(Schedule);

	if (typeof obj.employer_id != 'undefined') {
		tmp.data.employer_id = obj.employer_id;
	}
	if (typeof obj.date != 'undefined') {
		tmp.data.date = obj.date;
	}
	if (typeof obj.type != 'undefined') {
		tmp.data.type = obj.type;
	}
	if (typeof obj.creation_time != 'undefined') {
		tmp.data.creation_time = obj.creation_time;
	}
	if (typeof obj.image_loc != 'undefined') {
		tmp.data.image_loc = obj.image_loc;
	}
	if (typeof obj.shifts != 'undefined') {
		tmp.data.shifts = obj.shifts;
	}
	if (typeof obj.timezone != 'undefined') {
		tmp.data.timezone = obj.timezone;
	} else {
		tmp.data.timezone = 0;
	}

	return tmp;
}
exports.verifyUpload = function (id, cb) {
	db.query(Scheduleme.Queries.verifyUpload,[id], function (err, result) {
		var obj = {
			err 	: err,
			result 	: result
		}
		cb(obj);
	});
}
exports.getByEmployer = function (obj, cb) {

	id 			= obj.id;
	response 	= typeof obj.response != 'undefined' ? obj.response : {};

	if (typeof response.data == 'undefined') {
		response.data = {};
	}

	response.data.schedules = [];

	_this = Schedule;

	//var today = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
	db.query(Scheduleme.Queries.getSchedulesByEmployerFuture, [id, (new Date()).toISOString()], function (err, rows) {
		if (err) {
			response.statusCode = 500;
			response.message = err.code;
			response.data.schedules = [];
			Scheduleme.Logger.error(err.code);
			cb({'error': err});
		} else {
			var totalRows = rows.length;
			if (totalRows) {
				rows.forEach(function (row) {
					db.query(Scheduleme.Queries.getShiftsBySchedule, [row.id], function (err, shiftRows) {
						if (err) {
							console.log(err);
							cb({statusCode:500, message:err});
						} else {
							row.shifts = [];
							shiftRows.forEach(function (shiftRow) {
								shiftRow.start = (_this.unUTCify(new Date(shiftRow.start))).toUTCString();
								shiftRow.end = (_this.unUTCify(new Date(shiftRow.end))).toUTCString();
								row.shifts.push(shiftRow);
							})
							if (row.shifts.length) {
								row.type = "shifted";
							}
							response.data.schedules.push(row);

							totalRows--;
							if (totalRows == 0) {
								cb(response);
							}
						}
					})
				})
			} else {
				response.data.schedules = [];
				cb(response);
			}
		}
	});
}

exports.getByEmployerDate = function (obj, cb) {
	id 			= obj.id;
	date 		= obj.date;
	response 	= typeof obj.response != 'undefined' ? obj.response : {};

	db.query(Scheduleme.Queries.getScheduleByEmployerDate, [id,date], function (err, row) {

		if (row[0]) {

			db.query(Scheduleme.Queries.getShiftsBySchedule, [row[0].id], function (err, shiftRows) {
				row[0].shifts = [];
				shiftRows.forEach(function (shiftRow) {
					shiftRow.start = (_this.unUTCify(new Date(shiftRow.start))).toISOString();
					shiftRow.end = (_this.unUTCify(new Date(shiftRow.end))).toISOString();
					row[0].shifts.push(shiftRow);
				})

				if (row[0].shifts.length) {
					row[0].type = "shifted";
				}
				var obj = {
					err 		: err,
					row 		: row[0],
					response 	: response
				}

				cb(obj);

			})
		} else {

			var obj = {
				err 		: err,
				row 		: row[0],
				response 	: response
			}

			cb(obj);
		}
	});
}