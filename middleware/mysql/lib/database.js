
var mysql = require('mysql') ,
    pool;

function handleDisconnect(connection) {
  connection.on('error', function(err) {
    if (!err.fatal) {
      return;
    }

    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }

    console.log('Re-connecting lost connection: ' + err.stack);

    connection = mysql.createConnection(connection.config);
    handleDisconnect(connection);
    connection.connect();
  });
}


/**
 * Initialize the MySQL connection pool config.
 */

exports.init = function(config) {

  // Create each pool connection by creating the connection and
    // attaching error handling
  config.createConnection = function (options) {
    var connection = mysql.createConnection(options);

    //Any custom formatting here
    
    handleDisconnect(connection);

    return connection;
  }

  pool = mysql.createPool(config);
};

// The following has been borrowed from the mysql-simple library

/**
 * Execute a query that is expected to return zero or more rows.
 * @param {string} query SQL query to execute
 * @param {Array.<Object>} data Parameters to substitute into the query
 * @param {function(string, Array.<Object>)} callback Callback to execute when
 *        the query completes
 */
exports.query = function(query, data, callback) {
  pool.getConnection( function(err, connection) {
    if (err) {
      console.log ('ERROR: Error trying to get connection: '+err);
    } else {
      connection.query(query, data, function(err, results, fields) {
        try { callback(err, results); }
        finally { connection.end(); }
      });
    }
  });
};

/**
 * Execute a query that is expected to return zero or one rows.
 */
exports.querySingle = function(query, data, callback) {
  pool.getConnection( function(err, connection) {
    if (err) {
      console.log ('ERROR: Error trying to get connection: '+err);
    } else {
      connection.query(query, data, function(err, results, fields) {
        try { callback(err, (results && results.length > 0) ? results[0] : null); }
        finally { connection.end(); }
      });
    }
  });
};

/**
 * Execute a query that is expected to return many rows, and stream the results
 * back one row at a time.
 */
exports.queryMany = function(query, data, rowCallback, endCallback) {
  pool.getConnection( function(err, connection) {
    if (err) {
      console.log ('ERROR: Error trying to get connection: '+err);
    } else {
      connection.query(query, data)
        .on('error', function(err) {
          try { if (endCallback) endCallback(err); }
          finally { connection.end(); }
        })
        .on('row', rowCallback)
        .on('end', function() {
          try { if (endCallback) endCallback(null); }
          finally { connection.end(); }
        });
    }
  });
};

/**
 * Execute a query that is not expected to return any rows.
 */
exports.nonQuery = function(query, data, callback) {
  pool.getConnection( function(err, connection) {
    if (err) {
      console.log ('ERROR: Error trying to get connection: '+err);
    } else {
      connection.query(query, data, function(err, info) {
        try { if (callback) callback(err, info); }
        finally { connection.end(); }
      });
    }
  });
};
