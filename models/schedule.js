var Scheduleme = require('../helpers/global');
var db = require('../db/dbconnection');

var Schedule = {

	data: {

	},
	validate: function () {

	},
	generateUpdateQuery: function () {
		var sets = [];
		var vals = [];
		for (var key in this.data) {
			sets.push(key+'=?');
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
			queryString : 'INSERT INTO schedules (employer_id, date, type, creation_time, image_loc) VALUES (?,?,?,NOW(),?)',
			values		: [this.data.employer_id, this.data.date, this.data.type, this.data.image_loc]
		}

		return returnObject;
	},
	save : function (cb) {
		if (Scheduleme.Config.debug) Scheduleme.Logger.info('Saving Schedule');

		if (typeof this.id == 'undefined') { //Create
			var obj = this.generateInsertQuery();

			if (Scheduleme.Config.debug) Scheduleme.Logger.info('Query object: '+JSON.stringify(obj));

			db.query(obj.queryString, obj.values, cb);
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

	response.schedules = [];

	/*db.query(Scheduleme.Queries.getSchedulesByEmployer, [id])
		.on('error', function (err) {
			//Handle error, and 'end' event will be emitted after this.
			response.statusCode = 500;
			response.message = err.code;
			response.schedules = [];
			Scheduleme.Logger.error(err.code);
		})
		.on('fields', function (fields) {
		})
		.on('result', function (row) {
			response.schedules.push(row);
		})
		.on('end', function () {
			cb(response);
		})*/
	db.query(Scheduleme.Queries.getSchedulesByEmployer, [id], function (err, rows) {
		if (err) {
			response.statusCode = 500;
			response.message = err.code;
			response.schedules = [];
			Scheduleme.Logger.error(err.code);
		} else {
			rows.forEach(function (row) {
				response.schedules.push(row);
			})
		}
		cb(response);
	});
}

exports.getByEmployerDate = function (obj, cb) {
	id 			= obj.id;
	date 		= obj.date;
	response 	= typeof obj.response != 'undefined' ? obj.response : {};

	db.query(Scheduleme.Queries.getScheduleByEmployerDate, [id,date], function (err, row) {

		var obj = {
			err 		: err,
			row 		: row[0],
			response 	: response
		}

		cb(obj);
	});
}