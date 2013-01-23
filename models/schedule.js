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
		if (config.debug) console.log('Saving Schedule');

		if (typeof this.id == 'undefined') { //Create
			var obj = this.generateInsertQuery();

			if (config.debug) console.log('Query object: '+JSON.stringify(obj));

			db.query(obj.queryString, obj.values, cb);
		} else { //Update
			var obj = this.generateUpdateQuery();

			if (config.debug) console.log('Query object: '+JSON.stringify(obj));

			db.query(obj.queryString, obj.values, cb);
		}

		return true;
	},
	delete : function (success, failure) {
		if (config.debug)console.log('Updating Employee');
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
	db.query(query,[id], cb(err, result));
}