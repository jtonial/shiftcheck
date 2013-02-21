module.exports = config = {

	"name" : "Shift-check",
	"name_lower": "shift-check",

	"port" : 3100,
	"ssl_port" : 3101,

	//The defaults are for local
	"mysql_user" : process.env.CLEARDB_DATABASE_USER || 'root',
	"mysql_password" : process.env.CLEARDB_DATABASE_PASSWORD || 'password',
	"mysql_db" : process.env.CLEARDB_DATABASE_DB || 'scheduleme',
	"mysql_host" : process.env.CLEARDB_DATABASE_HOST || 'localhost',
	"mysql_port" : process.env.CLEARDB_DATABASE_PORT || 3306,

	"mongo_host" : "localhost",
	"mongo_port" : 27017,
	"mongo_db" : "schedule",

	"debug": true
}
