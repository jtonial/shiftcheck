
global.__basedir = __dirname+'/../../..';

function wrapAsync (t) {
  return function (callback) {
    t.then( function () {
      callback();
    }, function (err) {
      callback(err);
    });
  };
}

var Config  = require('../../config/mysql') ,
    Knex    = require('knex') ,
    when    = require('when') ,
    series  = require('when/sequence') ,
    async   = require('async') ,
    _       = require('underscore') ,
    knex    = Knex.initialize({
      client: Config.client ,
      connection: {
        host      : Config.host ,
        user      : Config.user ,
        password  : Config.password ,
        database  : Config.database ,
        charset   : 'utf8'
      }
    });

exports.up = function(next){

  var tasks = [
    knex.schema.createTable('tableName', function (t) {
      t.increments('_id').unsigned().notNullable().primary();
      t.dateTime('creation_time').notNullable();
      t.timestamp('modified_time').notNullable();
      //t.timestamps();
    })
  ];

  async.series(_.map(tasks, wrapAsync), function (err) {
    if (err) console.log(err);
    next(err);
  });

};

exports.down = function(next){

  var tasks = [
    knex.schema.dropTableIfExists('tableName')
  ];

  async.series(_.map(tasks, wrapAsync), function (err) {
    if (err) console.log(err);
    next(err);
  });

};