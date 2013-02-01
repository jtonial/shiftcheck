console.log('including db connection...');

var Scheduleme = require('../helpers/global');

/*
var mysql = require('mysql');


if (typeof process.env.PORT == 'undefined') {
	//Create the MySQL connection
	var db = mysql.createConnection(
	//{
	//	host     : process.env.CLEARDB_DATABASE_URL || 'localhost',
	//	user     : process.env.CLEARDB_DATABASE_USER || 'root',
	//	password : process.env.CLEARDB_DATABASE_PASSWORD || 'password',
	//	database : process.env.CLEARDB_DATABASE_DB || 'scheduleme'
	//}
} else {
	//Heroku specific
	//Create the MySQL connection
	var db = mysql.createConnection(
	//{
	//	host     : process.env.CLEARDB_DATABASE_URL,
	//	user     : process.env.CLEARDB_DATABASE_USER,
	//	password : process.env.CLEARDB_DATABASE_PASSWORD,
	//	database : process.env.CLEARDB_DATABASE_DB
	//}
	process.env.CLEARDB_DATABASE_FULLURL);
}

db.connect(function (err) {
	if (err) {
		Scheduleme.Logger.error('There was an error connecting to db: '+err);
	} else {
		Scheduleme.Logger.info('MySQL Connection open');
	}
	return db;
});

function handleDisconnect(db) {
	db.on('error', function(err) {
		if (!err.fatal) {
			return;
		}

		if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
			throw err;
		}

		Scheduleme.Logger.warn('Re-connecting lost MySQL connection: ' + err.stack);
		//console.log(this);
		db = mysql.createConnection(db.config);
		handleDisconnect(db);
		db.connect(function (err) {
			if (err) {
				Scheduleme.Logger.error('There was an error connecting to db: '+err);
			} else {
				Scheduleme.Logger.info('MySQL Connection open');
			}
		});
	});
}
//Add disconnect handlers
handleDisconnect(db);

*/

//Note: I am not sure how much flexibility this library will offer
	//I'm only using it because it seems to be able to handle disconnects, and should
	// suffice untill node-mysql implements its own error handling/connectino pooling
var database = require('mysql-simple');
// Port number is optional

if (typeof process.env.CLEARDB_DATABASE_USER != 'undefined'){
	database.init(process.env.CLEARDB_DATABASE_USER, process.env.CLEARDB_DATABASE_PASSWORD, process.env.CLEARDB_DATABASE_DB, process.env.CLEARDB_DATABASE_HOST, 3306);
} else {
	database.init('root', 'password', 'scheduleme', 'localhost', 3306);
}

/*
  host:     'us-cdbr-east-03.cleardb.com',
  user:     'b64e2b7de3765a',
  password: '2d98cd53',
  database: 'heroku_e108115fff2be36'
*/

module.exports = database;