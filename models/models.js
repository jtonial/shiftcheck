var mongoose = require('mongoose')
	, config = require('../config/config');
	;

//Make Schemas and models
var EmployeeSchema = new mongoose.Schema({
	email: String,
	username: String,
	password: String,
	first_name: String,
	last_name: String,
	employer: mongoose.Schema.ObjectId,
	positions: [String],
	last_login:Date,
	login_count:Number,
	reg_time:Date
})

var RequestSchema = new mongoose.Schema({
	_id: mongoose.Schema.ObjectId,
	shift: mongoose.Schema.ObjectId,
	from: mongoose.Schema.ObjectId,
	to: mongoose.Schema.ObjectId,
	posted_time: Date,
	request_time: Date,
})
var EmployerSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	positions: [String],
	contact_info: {
		email: String,
		phone: String,
		address: String
	},
	schedule_type: String,
	open_requests: [RequestSchema],
	img: String,
	last_login: Date,
	login_count: Number,
	reg_time: Date
})
var HistorySchema = new mongoose.Schema({
	from: mongoose.Schema.ObjectId,
	to: mongoose.Schema.ObjectId,
	posted_time: Date,
	request_time: Date,
	approved_time: Date,
	approved_by: String,
})
var ShiftSchema = new mongoose.Schema({
	_id: mongoose.Schema.ObjectId,
	employee: mongoose.Schema.ObjectId,
	start_time: Date,
	end_time: Date,
	position: String,
	upforgrabs: {
		forgrabs: Boolean,
		posted_time: Date
	},
	history: [HistorySchema]
})
var ScheduleSchema = new mongoose.Schema({
	employer: mongoose.Schema.ObjectId,
	date: {
		date: Date,
		length: Number
	}, //Number of days in the schedule
	creation_time: Date,
	last_modified: Date,
	image_loc: String,
	shifts: [ShiftSchema],
	awaitingupload: Boolean
})

//Tracking
var TrackingSchema = new mongoose.Schema({
	user_type: String,
	id: mongoose.Schema.ObjectId,
	method: String,
	url: String,
	time: Date,
	ip: String
})
var TrackingLoginSchema = new mongoose.Schema({
	user_type: String,
	id: mongoose.Schema.ObjectId,
	time: Date,
	ip: String,
	statusCode: Number
})

var dbhost = process.env.MONGOLAB_URI || config.mongo_host
	, dbdb = config.mongo_db
	;
var db;
if (typeof process.env.PORT == 'undefined') {
	db = mongoose.createConnection(dbhost, dbdb);
} else {
	db = mongoose.createConnection(dbhost, function () {
		console.log('Connection created');
	});
}
db.on('error', function () {
	console.error.bind(console, 'connection error:');
	console.log('db connection error:');
});
db.once('open', function () {
	console.log('db connection open:');
});

exports.Employee = db.model('employees', EmployeeSchema);
exports.Employer = db.model('employers', EmployerSchema);
exports.Schedule = db.model('schedules', ScheduleSchema);
exports.Tracking = db.model('logs_requests', TrackingSchema);
exports.TrackLogin = db.model('logs_logins', TrackingLoginSchema);
exports.HistorySchema = HistorySchema;
exports.RequestSchema = RequestSchema;