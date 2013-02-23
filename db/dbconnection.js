console.log('including db connection...');

var Scheduleme = require('../helpers/global');

//I'm not sure why Config doesn't seem to be set at this point but this hack works.
Scheduleme.Config = require('../config/config');

var database = require('../middleware/mysql-simple');
// Port number is optional

//Doing this all with configs makes it very easy for me to switch environments (Making Config dynamic based on mode (dev vs prod), etc)
database.init(Scheduleme.Config.mysql.user, Scheduleme.Config.mysql.password, Scheduleme.Config.mysql.db, Scheduleme.Config.mysql.host, Scheduleme.Config.mysql.port);

module.exports = database;