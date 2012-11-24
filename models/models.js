var mongoose = require('mongoose')
	, config = require('../config/config');
	;

//Make Schemas and models
var EmployeeSchema = new mongoose.Schema({
	email: String,
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
	date: Date,
	creation_time: Date,
	image_loc: String,
	shifts: [ShiftSchema]
})


var dbhost = process.env.MONGOLAB_URI || config.mongo_host
	, dbdb = config.mongo_db
	;
var db = mongoose.createConnection(dbhost, function () {
	console.log('Connection created');
});
db.on('error', function () {
	console.error.bind(console, 'connection error:');
});
db.once('open', function () {
	console.log('db connection open:');
});

exports.Employee = db.model('employees', EmployeeSchema);
exports.Employer = db.model('employers', EmployerSchema);
exports.Schedule = db.model('schedules', ScheduleSchema);
exports.HistorySchema = HistorySchema;
exports.RequestSchema = RequestSchema;
