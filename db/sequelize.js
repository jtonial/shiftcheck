//Tests

var Project = sequelize.define('Project', {
		title:: Sequelize.String,
		description: Sequelize.Text
	})

var Tasks = sequelize.define('Task', {
		title: Sequelize.String,
		description: Sequelize.Text,
		deadline: Sequelize.Date
	})


//Actual
var Employer = sequelize.define('Employer', {
		name: Sequelize.String,
		email: Sequelize.String,
		username: Sequelize.String,
		password: Sequelize.String,
		contact_email: Sequelize.String,
		contact_phone: Sequelize.String,
		contact_address: Sequelize.String,
		img: Sequelize.String,

		last_login: Sequelize.Date,
		login_count: Sequelize.Number,
	}//Create object methods for incrementing login_count
	)
var Employee = sequelize.define('Employee', {
		email: Sequelize.String,
		username: Sequelize.String,
		password: Sequelize.String,
		first_name: Sequelize.String,
		last_name: Sequelize.String,
		last_login: Sequelize.Date,
		login_count: Sequelize.Number,
	}//Create object methods for incrementing login_count
	).hasOne(Employer);
var Schedule = sequelize.define('Schedule', {
		date: Sequelize.Date,
		type: Sequelize.String,
		image_loc: Sequelize.String
	}).hasOne(Employer);