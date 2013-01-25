var Scheduleme = require('../helpers/global');

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
		if (Scheduleme.Config.debug) console.log('Saving Schedule');

		if (typeof this.id == 'undefined') { //Create
			var obj = this.generateInsertQuery();

			if (Scheduleme.Config.debug) console.log('Query object: '+JSON.stringify(obj));

			db.query(obj.queryString, obj.values, cb);
		} else { //Update
			var obj = this.generateUpdateQuery();

			if (Scheduleme.Config.debug) console.log('Query object: '+JSON.stringify(obj));

			db.query(obj.queryString, obj.values, cb);
		}

		return true;
	},
	delete : function (success, failure) {
		if (Scheduleme.Config.debug)console.log('Updating Employee');
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
	var query = "UPDATE schedules SET awaitingupload=0 WHERE schedule_id=?"
	db.query(query,[id], function (err, result) {
		var obj = {
			err 	: err,
			result 	: result
		}
		cb(obj);
	});
}
exports.getByEmployer = function (obj, cb) {
	console.log(' Model.Schedule.getByEmployer');
	id 			= obj.id;
	response 	= typeof obj.response != 'undefined' ? obj.response : {};

	response.schedules = [];

	query = 'SELECT schedule_id, date, type, image_loc AS url FROM schedules WHERE employer_id=? AND awaitingupload = false';

	db.query(query, [id])
		.on('error', function (err) {
			//Handle error, and 'end' event will be emitted after this.
			response.statusCode = 500;
			response.message = err.code;
			response.schedules = [];
			console.log(err.code);
		})
		.on('fields', function (fields) {
			//The field packets for the rows to follow

			//This fires once, whether or not row are returned
			//console.log ('in fields callback');
		})
		.on('result', function (row) {
			response.schedules.push(row);
		})
		.on('end', function () {
			cb(response);
		})
}

exports.getByEmployerDate = function (obj, cb) {
	id 			= obj.id;
	date 		= obj.date;
	response 	= typeof obj.response != 'undefined' ? obj.response : {};

	query = 'SELECT schedule_id, date, type, image_loc AS url FROM schedules WHERE employer_id=? AND date=? AND awaitingupload = false LIMIT 1';

	db.query(query, [id,date], function (err, row) {

		var obj = {
			err 		: err,
			row 		: row[0],
			response 	: response
		}

		cb(obj);
	});
}