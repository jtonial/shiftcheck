
require(__basePath+'/connections/logger').info('Loading mysql engine...');

var mysql;

var mysql_config = {
  local   : {
    user      : 'root',
    password  : 'password',
    database  : 'shiftcheck',
    host      : 'localhost',
    port      : 3306,
    connectionLimit : 100
  },
  cleardb : {
    user      : process.env.CLEARDB_DATABASE_USER,
    password  : process.env.CLEARDB_DATABASE_PASSWORD,
    database  : process.env.CLEARDB_DATABASE_DB,
    host      : process.env.CLEARDB_DATABASE_HOST,
    port      : process.env.CLEARDB_DATABASE_PORT || 3306,
    connectionLimit : 30
  },
  rds   : {
    user      : process.env.RDS_USER,
    password  : process.env.RDS_PASSWORD,
    database  : 'shiftcheck_'+(process.env.shiftcheck_mode || 'development'),
    host      : process.env.RDS_HOST,
    port      : 3306,
    connectionLimit : 10
  },
  test  : {
    user      : 'root',
    password  : 'password',
    database  : 'shiftcheck_test',
    host      : 'localhost',
    port      : 3306,
    connectionLimit : 100
  }
};

// TODO: Add Redis connection details

//This can be dynamically set (in reality would be dev vs production vs etc)
if (process.env.RDS_USER) {
  mysql = mysql_config.rds;
} else if (process.env.CLEARDB_DATABASE_USER) {
  mysql = mysql_config.cleardb;
} else {
  mysql = mysql_config.local;
}

if (process.env.NODE_DB == 'local') {
  require(__basePath+'/connections/logger').info('    Using local db');
  mysql = mysql_config.local;
}

module.exports = mysql;
