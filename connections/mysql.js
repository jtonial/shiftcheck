
require(__basedir+'/connections/logger').info('Loading mysql connection...');

var Main      = require('../helpers/global') ;

//I'm not sure why Config doesn't seem to be set at this point but this hack works for now
Main.Config = require('../config');

var database = require('./mysql/index.js');

database.init(Main.Config.mysql);

module.exports = database;
