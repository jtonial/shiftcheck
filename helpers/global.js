console.log('Loading global.js');

exports.Helpers     = require('../helpers/helpers')
exports.Render      = require('../helpers/render');

exports.Config      = require('../config');

exports.db          = require('../db/dbconnection');
exports.Redis       = require('../db/redis');
//exports.Memcache    = require('../db/memcache');

exports.Controllers = {
  Employees : require('../lib/employees/controller'),
  Employers : require('../lib/employers/controller')
};
exports.Models      = {
  Employee : require('../lib/employees/model'),
  Employer : require('../lib/employers/model'),
  Schedule : require('../lib/schedules/model')
};
exports.Tracking    = require('../helpers/tracker');
exports.Cache       = require('../helpers/cache');
//By exporting the Logger here I can modify the transports no problem
exports.Logger      = require('../helpers/logger');
exports.Queries     = require('../helpers/queries');
exports.Permissions = require('../helpers/permissions');