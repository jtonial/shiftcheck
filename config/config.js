config = {

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

mysql_config = {
	local 	: {
		"user" 	 : 'root',
		"password" : 'password',
		"db" 		 : 'scheduleme',
		"host" 	 : 'localhost',
		"port" 	 : 3306
	},
	cleardb : {
		"user" 	 : process.env.CLEARDB_DATABASE_USER ,
		"password" : process.env.CLEARDB_DATABASE_PASSWORD,
		"db" 		 : process.env.CLEARDB_DATABASE_DB ,
		"host" 	 : process.env.CLEARDB_DATABASE_HOST,
		"port" 	 : process.env.CLEARDB_DATABASE_PORT || 3306
	},
	rds 	: {
		"user" 	 : "",
		"password" : "",
		"db" 		 : "",
		"host" 	 : "",
		"port" 	 : 3306
	}
}

//This can be dynamically set (in reality would be dev vs production vs etc)
config.mysql = process.env.CLEARDB_DATABASE_USER ? mysql_config.cleardb : mysql_config.local;

module.exports = config;