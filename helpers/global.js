console.log('Loading global.js');

exports.Helpers 	= {
		Render	: require('../helpers/render'),
		Helpers : require('../helpers/helpers')
	};
exports.Controllers = {
		Employees : require('../controllers/employees'),
		Employers : require('../controllers/employers'),
		Schedules : require('../controllers/schedules'),
		Grabs : require('../controllers/grabs')
	};
exports.Models 		= {
		Employee : require('../models/employee'),
		Employer : require('../models/employer'),
		Schedule : require('../models/schedule')
	};
exports.Tracking 	= require('../helpers/tracker');
exports.Config 		= require('../config/config');