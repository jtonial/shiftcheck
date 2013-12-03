
global.__basedir = __dirname+'/../..';

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
        database  : Config.database+'__migrate_test' ,
        charset   : 'utf8'
      }
    });

exports.up = function(next){

  var tasks = [
    knex.schema.createTable('employers', function (t) {
      t.increments('employer_id').unsigned().notNullable().primary();

      t.string('name').notNullable();
      t.string('contact_email').notNullable();
      t.string('contact_phone').notNullable();

      t.string('img', 50);

      t.dateTime('creation_time').notNullable();
      t.timestamp('modified_time').notNullable();
      //t.timestamps();
    }),
    knex.schema.createTable('users', function (t) {
      t.increments('user_id').unsigned().notNullable().primary();

      t.string('first_name').notNullable();
      t.string('last_name').notNullable();
      
      t.integer('employer_id').unsigned().notNullable();

      t.boolean('admin').notNullable().defaultTo(0);

      t.string('username').notNullable();
      t.string('email').notNullable();
      t.string('password').notNullable();

      t.boolean('active').notNullable().defaultTo(1);
      t.boolean('deleted').notNullable().defaultTo(0);

      t.dateTime('last_login').notNullable();
      t.integer('login_count').notNullable().defaultTo(0);
      t.dateTime('reg_time').notNullable();

      //t.dateTime('creation_time').notNullable();
      t.timestamp('modified_time').notNullable();
      //t.timestamps();
    }),
    knex.schema.createTable('positions', function (t) {
      t.increments('position_id').unsigned().notNullable().primary();
      t.integer('employer_id').unsigned().notNullable().references('employer_id').inTable('employers');

      t.string('position', 5).notNullable();
      t.integer('order').notNullable();

      t.string('full_name').notNullable();
      t.string('description').notNullable();

      t.boolean('active').notNullable().defaultTo(1);
      t.boolean('deleted').notNullable().defaultTo(0);

      t.dateTime('creation_time').notNullable();
      t.timestamp('modified_time').notNullable();
      //t.timestamps();
    }),
    // Add UNIQUE (employer_id, position) index
    //knex.raw('', function (res) { }),
    knex.schema.createTable('employee_positions', function (t) {
      t.increments('ep_id').unsigned().notNullable().primary();
      t.integer('employer_id').unsigned().notNullable().references('employer_id').inTable('employers');
      t.integer('position_id').unsigned().notNullable().references('position_id').inTable('positions');

      t.dateTime('creation_time').notNullable();
      t.timestamp('modified_time').notNullable();
      //t.timestamps();
    }),
    knex.schema.createTable('schedules', function (t) {
      t.increments('schedule_id').unsigned().notNullable().primary();
      t.integer('employer_id').unsigned().notNullable().references('employer_id').inTable('employers');

      t.dateTime('date').notNullable();
      t.integer('timezone').notNullable().defaultTo(0);

      t.boolean('published').notNullable().defaultTo(0);

      t.dateTime('creation_time').notNullable();
      t.timestamp('modified_time').notNullable();
      //t.timestamps();
    }),
    knex.schema.createTable('shifts', function (t) {
      t.increments('shift_id').unsigned().notNullable().primary();
      t.integer('schedule_id').unsigned().notNullable().references('schedule_id').inTable('schedules');

      t.integer('position_id').unsigned().notNullable().references('position_id').inTable('positions');
      t.integer('employee_id').unsigned().notNullable().references('user_id').inTable('users');

      t.integer('start').notNullable();
      t.integer('end').notNullable();

      t.dateTime('creation_time').notNullable();
      t.timestamp('modified_time').notNullable();
      //t.timestamps();
    }),
    knex.schema.createTable('available_shifts', function (t) {
      t.increments('available_shift_id').unsigned().notNullable().primary();
      t.integer('shift_id').unsigned().notNullable().references('shift_id').inTable('shifts');

      t.integer('employee_id').unsigned().notNullable();//.references('user_id').inTable('users');
      t.integer('employer_id').unsigned().notNullable();//.references('employer_id').inTable('employers');

      t.text('notes');

      t.boolean('active').notNullable().defaultTo(1);
      
      t.dateTime('creation_time').notNullable();
      t.timestamp('modified_time').notNullable();
      //t.timestamps();
    }),
    knex.schema.createTable('requests', function (t) {
      t.increments('request_id').unsigned().notNullable().primary();
      t.integer('available_shift_id').unsigned().notNullable().references('available_shift_id').inTable('available_shifts');

      t.integer('from_employee').unsigned().notNullable();//.references('users').inTable('user_id');
      t.integer('to_employee').unsigned().notNullable();//.references('users').inTable('user_id');

      t.integer('state').notNullable().defaultTo(0);
      t.text('notes');

      t.integer('response_by').unsigned().notNullable();//.references('users').inTable('user_id');
      
      t.dateTime('response_time');

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
    knex.schema.dropTableIfExists('requests') ,
    knex.schema.dropTableIfExists('available_shifts') ,
    knex.schema.dropTableIfExists('shifts') ,
    knex.schema.dropTableIfExists('schedules') ,
    knex.schema.dropTableIfExists('employee_positions') ,
    knex.schema.dropTableIfExists('positions') ,
    knex.schema.dropTableIfExists('employees') ,
    knex.schema.dropTableIfExists('employers')
  ];

  async.series(_.map(tasks, wrapAsync), function (err) {
    if (err) console.log(err);
    next(err);
  });

};
