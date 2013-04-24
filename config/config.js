config = {

  "name" : "Shift-check",
  "name_lower": "shift-check",

  "port" : 3100,
  "ssl_port" : 3101,

  "debug": true,

  "facebook_url" : '',
  "twitter_url" : ''
}

//Note that process.env.shiftcheck_mode will be either 'development' or 'production' and will match the db suffix
mongo_config = {
  local   : {
    "host"     : "localhost",
    "port"     : 27017,
    "db"     : "schedule"
  }
}
mysql_config = {
  local   : {
    "user"     : 'root',
    "password" : 'password',
    "db"       : 'scheduleme',
    "host"     : 'localhost',
    "port"     : 3306
  },
  cleardb : {
    "user"     : process.env.CLEARDB_DATABASE_USER,
    "password" : process.env.CLEARDB_DATABASE_PASSWORD,
    "db"       : process.env.CLEARDB_DATABASE_DB,
    "host"     : process.env.CLEARDB_DATABASE_HOST,
    "port"     : process.env.CLEARDB_DATABASE_PORT || 3306
  },
  rds   : {
    "user"     : process.env.RDS_USER,
    "password" : process.env.RDS_PASSWORD,
    "db"       : 'shiftcheck_'+(process.env.shiftcheck_mode || 'development'),
    "host"     : process.env.RDS_HOST,
    "port"     : 3306
  },
  test  : {
    "user"     : 'root',
    "password" : 'password',
    "db"       : 'shiftcheck_test',
    "host"     : 'localhost',
    "port"     : 3306
  }
}

// TODO: Add Redis connection details

//This can be dynamically set (in reality would be dev vs production vs etc)
if (process.env.RDS_USER) {
  config.mysql = mysql_config.rds;
} else if (process.env.CLEARDB_DATABASE_USER) {
  config.mysql = mysql_config.cleardb;
} else {
  config.mysql = mysql_config.local;
}

module.exports = config;