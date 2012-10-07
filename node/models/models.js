var  mongoose = require('mongoose')
	//, mongo  = require('mongodb')
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
	img: String,
	last_login: Date,
	login_count: Number,
	reg_time: Date
})
var ShiftSchema = new mongoose.Schema({
	_id: mongoose.Schema.ObjectId,
	employee: mongoose.Schema.ObjectId,
	start_time: Date,
	end_time: Date,
	position: String,
	upforgrabs: Boolean,
	history: [
		{
			from: mongoose.Schema.ObjectId,
			to: mongoose.Schema.ObjectId,
			posted_time: Date,
			request_time: Date,
			approved_time: Date,
			approved_by: String,
		}
	]
})
var ScheduleSchema = new mongoose.Schema({
	employer: mongoose.Schema.ObjectId,
	date: Date,
	creation_time: Date,
	shifts: [ShiftSchema]
})

var dbhost = 'localhost'
	, dbdb = 'schedule'
	;
var db2 = mongoose.createConnection(dbhost, dbdb);
db2.on('error', function () {
	console.error.bind(console, 'connection error:');
});
db2.once('open', function () {
	console.log('db connection open:');
});

exports.Employee = db2.model('employees', EmployeeSchema);
exports.Employer = db2.model('employers', EmployerSchema);
exports.Schedule = db2.model('schedules', ScheduleSchema);
