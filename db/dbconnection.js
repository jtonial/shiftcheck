console.log('including db connection...');

var Scheduleme = require('../helpers/global');

var database = require('mysql-simple');
// Port number is optional

if (typeof process.env.CLEARDB_DATABASE_USER != 'undefined'){
	database.init(process.env.CLEARDB_DATABASE_USER, process.env.CLEARDB_DATABASE_PASSWORD, process.env.CLEARDB_DATABASE_DB, process.env.CLEARDB_DATABASE_HOST, 3306);
} else {
	database.init('root', 'password', 'scheduleme', 'localhost', 3306);
}

module.exports = database;