
var Logger        = require(__basePath+'/connections/logger') ,
    mysql         = require('mysql') ,
    pool, conCount = 0, queryCount = 0; //Query count used for logs only

function handleDisconnect(connection) {
  connection.on('error', function(err) { // Note that RDS disconnects do not seem to trigger this; and the timeout is rediculously long
    Logger.info('MySQL : Connection Error Detected');
    Logger.info('MySQL Connection Count = '+pool._allConnections.length);

    if (!err.fatal) {
      return;
    }

    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }

    // When using the pool, an error will remove the connection from the pool. Thus creating the connection again
     // creates a connection to the DB, however the connection is still dropped from the pool.

     // Causes the max_conns to the db to be hit really early (after max_conns - pool_size timeouts, max cons hit)

    //console.log('Re-connecting lost connection: ' + err.stack);

    //connection = mysql.createConnection(connection.config);
    //handleDisconnect(connection);
    //mysql_queues(connection, false); // true is DEBUG

    //connection.connect();
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
    conCount++;
    Logger.info('mysql :: new-connection-created :: count = '+conCount);
    //Any custom formatting here

    // Apply disconnect logic. While using the pool, this really doesnt do much.
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
      Logger.error('mysql :: error trying to get connection :: '+err);
    } else {
      queryCount++;
      var queryId = queryCount;
      var sendTime = Date.now();
      Logger.info('mysql :: query-sending  :: id = '+queryId);
      connection.query(query, data, function(err, results, fields) {
        Logger.info('mysql :: query-received :: id = '+queryId+' :: duration = '+(Date.now()-sendTime));
        //console.log('query returned...');
        try { /*console.log('DB: Query complete');*/ callback(err, results, fields); }
        finally { if (connection) connection.release(); }
      });
    }
  });
};

/**
 * Execute a query that is expected to return zero or one rows.
 */
exports.querySingle = function(query, data, callback) {
  //console.log(':: CONNECTION :: COUNT : '+pool._allConnections.length);
  pool.getConnection( function(err, connection) {
    if (err) {
      Logger.error('mysql :: error trying to get connection :: '+err);
    } else {
      queryCount++;
      var queryId = queryCount;
      var sendTime = Date.now();
      Logger.info('mysql :: query-sending  :: id = '+queryId);
      connection.query(query, data, function(err, results, fields) {
        Logger.info('mysql :: query-received :: id = '+queryId+' :: duration = '+(Date.now()-sendTime));
        try { /*console.log('DB: Query complete');*/ callback(err, (results && results.length > 0) ? results[0] : null); }
        finally { if (connection) connection.release(); }
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
      Logger.error('mysql :: error trying to get connection :: '+err);
    } else {
      queryCount++;
      var queryId = queryCount;
      var sendTime = Date.now();
      Logger.info('mysql :: query-sending  :: id = '+queryId);
      connection.query(query, data)
        .on('error', function(err) {
          Logger.info('mysql :: query-received :: id = '+queryId+' :: duration = '+(Date.now()-sendTime));
          try { if (endCallback) endCallback(err); }
          finally { connection.release(); }
        })
        .on('row', rowCallback)
        .on('end', function() {
          Logger.info('mysql :: query-received :: id = '+queryId+' :: duration = '+(Date.now()-sendTime));
          try { if (endCallback) endCallback(null); }
          finally { if (connection) connection.release(); }
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
      Logger.error('mysql :: error trying to get connection :: '+err);
    } else {
      queryCount++;
      var queryId = queryCount;
      var sendTime = Date.now();
      Logger.info('mysql :: query-sending  :: id = '+queryId);
      connection.query(query, data, function(err, info) {
        Logger.info('mysql :: query-received :: id = '+queryId+' :: duration = '+(Date.now()-sendTime));
        try { if (callback) callback(err, info); }
        finally { if (connection) connection.release(); }
      });
    }
  });
};

// DANGEROUS:
 // NOTE : If this works, I can try making this startTransaction, and pass a trans to the cb
   // right now I'm worried that it will close the connection early
   // it is ending the connectino early
exports.getConnection = function (cb) {
  pool.getConnection( function(err, connection) {
    if (err) {
      Logger.error('mysql :: error trying to get connection :: '+err);
    } else {
      try { if (cb) cb(connection); }
      finally { }
      //finally { connection.end(); console.log('connection ended');}
    }
  });
};

exports._poolSize = function () {
  return pool._allConnections.length; // NEVER USE THIS. For checking connectinos only
};
