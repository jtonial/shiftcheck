console.log('Loading global.js');

exports.Helpers     = require('../helpers/helpers')
exports.Render      = require('../helpers/render');

exports.Config      = require('../config');

exports.db          = require('../db/dbconnection');

exports.Controllers = {
  Employees : require('../controllers/employees'),
  Employers : require('../controllers/employers')
};
exports.Models      = {
  Employee : require('../models/employee'),
  Employer : require('../models/employer'),
  Schedule : require('../lib/schedules/model')
};
exports.Tracking    = require('../helpers/tracker');
exports.Cache       = require('../helpers/cache');
//By exporting the Logger here I can modify the transports no problem
exports.Logger      = require('../helpers/logger');
exports.Queries     = require('../helpers/queries');
exports.Permissions = require('../helpers/permissions');