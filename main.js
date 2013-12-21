
require(__basedir+'/connections/logger').info('Loading global.js...');


exports.Helpers     = require('./helpers');
exports.Render      = require('./render');

exports.Config      = require('./config');

exports.db          = require('./connections/mysql');
exports.mysql       = require('./connections/mysql');

exports.Redis       = require('./connections/redis');
//exports.Memcache    = require('../db/memcache');

exports.Controllers = {
  Employees : require('./modules/employees/controller'),
  Employers : require('./modules/employers/controller')
};
exports.Models      = {
  Employer : require('./modules/employers/model'),
  Schedule : require('./modules/schedules/model')
};

exports.Logger      = require('./connections/logger');
