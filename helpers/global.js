console.log('Loading global.js');

exports.Helpers   = {
    Render  : require('../helpers/render'),
    Helpers : require('../helpers/helpers')
  };
exports.Controllers = {
    Employees : require('../controllers/employees'),
    Employers : require('../controllers/employers'),
    Schedules : require('../controllers/schedules'),
  };
exports.Models     = {
    Employee : require('../models/employee'),
    Employer : require('../models/employer'),
    Schedule : require('../models/schedule')
  };
exports.Tracking   = require('../helpers/tracker');
exports.Config     = require('../config/config');
exports.Cache    = require('../helpers/cache');
//By exporting the Logger here I can modify the transports no problem
exports.Logger    = require('../helpers/logger');
exports.Queries    = require('../helpers/queries');
exports.db       = require('../db/dbconnection');
exports.Permissions = require('../helpers/permissions');