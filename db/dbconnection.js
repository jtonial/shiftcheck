console.log('Loading db connection...');

var Scheduleme = require('../helpers/global');

//I'm not sure why Config doesn't seem to be set at this point but this hack works for now
Scheduleme.Config = require('../config/config');

var database = require('../middleware/mysql');

database.init(Scheduleme.Config.mysql);

module.exports = database;