console.log('including db connection...');

var Scheduleme = require('../helpers/global');

//I'm not sure why Config doesn't seem to be set at this point but this hack works.
Scheduleme.Config = require('../config/config');
console.log(Scheduleme);

var database = require('mysql-simple');
// Port number is optional

//Doing this all with configs makes it very easy for me to switch environments (Making Config dynamic based on mode (dev vs prod), etc)
database.init(Scheduleme.Config.mysql_user, Scheduleme.Config.mysql_password, Scheduleme.Config.mysql_db, Scheduleme.Config.mysql_host, Scheduleme.Config.mysql_port);

module.exports = database;