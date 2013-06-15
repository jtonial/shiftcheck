var _           = require('underscore')._ ,
    Backbone    = require('backbone') ,
    db          = require('../../db/dbconnection') ,
    Queries     = require('./queries') ;

/*
  In future a product will not an one image, but will have multiple. This will require a specific function to add and remove images
*/

var EmployeeModel = Backbone.Model.extend({

  defaults: {

  },

  // Im thinking of defining each attribute here, as well as validation information, if its protected (allowed to be modified)
    // and whether its public (should be returned).
    // I'll have to think of a good way to prevent protected things from being changed still
    // (right now it works fine because the query only saves specific things, which isnt really scalable)
  schema: {
    password : {
      required  : true,
      protected : true,
      public    : false
    },
    salt : {
      required  : true,
      protected : true,
      public    : false
    },
  },

  /*
  toFullJSON: function () {
    var json = this.toJSON();
    return _.extend(json, { user_id: this.id });
  },
  */

  toPublicJSON: function () {
    var json  = this.toJSON();
    var _this = this;

    var toDelete = [];
    _.keys(_this.schema).forEach( function (attr) {
      if (!_this.schema[attr].public) toDelete.push(attr);
    })
    //_.filter(this.schema, function (attr) { return !attr.public; })

    toDelete.forEach( function (attr) {
      delete json.attr;
    })
    return json;
  },

  validate: function (attrs, options) {
    var errors = [];
    var _this = this;

    _.keys(_this.schema).forEach( function (attr) {
      if (_this.schema[attr].required) {
        if (typeof _this.get(attr) == 'undefined') {
          errors.push(attr+' is a required field');
        }
      }
    })

    /*
    if (this.get('end') <= this.get('start')) {
      errors.push('Shift cannot end before it begins');
    }
    */

    /*
      db.query(Queries.checkEmployeeShift.query, params, function (err, rows) {
        if (err) {
          cb( { error : err }, null );
        } else if (rows && rows.length) {
          cb( { error : 'Employee '+employee_id+' has a conflicting shift' }, null);
        } else {
          db.query(Queries.update, [ employee_id, position_id, start, end, shift_id ], function (err, result) {
            if (err) {
              cb( { error : err }, null );
            } else {
              cb( null, null );
            }
          })
        }
      })
    */

    /*
      Here is where I need to validate employee shift overlap
    */
    if (!_.isEmpty(errors)) return errors;
  },

  initialize: function () {
    
  },

  save: function (cb) {

    var errors = this.validate();

    if (!errors) {
      var _this = this;

      if (this.id) {
        // Update

        db.query(Queries.update, [this.get('employee_id'), this.get('position_id'), this.get('start'), this.get('end'), this.id], function (err, result) {

          cb(err, result);
          // OR
          // cb(_this);
        });
      } else {
        // Insert
        db.query(Queries.insert, [this.get('email'), this.get('username'), this.get('password'), this.get('salt'), this.get('first_name'), this.get('last_name'), this.get('employer_id')], function (err, result) {
          if (!err) {
            _this.id = result.insertId;
          }

          cb(err, result);
          // OR
          // cb(_this);
        });
      }
    } else {
      this._invalid = true;
      this._validationErrors = errors;
      cb( { errors : errors }, null );
    }
  },
  fetch: function (cb) {
    if (this.id) {
      var _this = this;
      db.querySingle(Queries.selectById, [this.id], function (err, row) {

        if (err) Main.Logger.error(err);
        
        if (row) {
          _.keys(row).forEach( function (attr) {
            _this.set(attr, row[attr]);
          })

        } else {
          _this._notExists = true;
        }

        cb();

      });
    }
  },
  destroy: function (cb) {
    if (this.id) {
      var _this = this;
      var response = {};

      db.query(Queries.selectShiftsFuture, [ _this.id ], function (err, rows) {
        if (err) { 
          response.statusCode = 500;
          response.message = err;
          Main.Logger.error(err);
          cb(err, response);
        } else if (rows.length) { // Future shifts use the position
          response.statusCode = 400;
          response.message = 'This employee has future shifts. Please correct this before deleting the employee.';
          cb(err, response);
        } else { // Okay to delete
          db.query(Queries.delete, [ _this.id ], function (err, result) {
            if (err) {
              response.statusCode = 500;
              response.message = err;
              Main.Logger.error(err);
            } else {
              response.statusCode = 200;
            }
            cb(err, result);
          });
        }
      });

    }
  }

});
  
module.exports = EmployeeModel;
