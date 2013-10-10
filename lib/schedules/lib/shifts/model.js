var _           = require('underscore')._ ,
    Backbone    = require('backbone') ,
    db          = require(__basedir+'/db/mysql') ,
    Queries     = require('./helpers/queries.js') ;

/*
  In future a product will not an one image, but will have multiple. This will require a specific function to add and remove images
*/

var ShiftModel = Backbone.Model.extend({

  defaults: {

  },

  validate: function (attrs, options) {
    var errors = [];

    if (this.get('end') <= this.get('start')) {
      errors.push('Shift cannot end before it begins');
    }

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

          cb(err);

        });
      } else {
        // Insert

        db.query(Queries.insert, [this.get('schedule_id'), this.get('start'), this.get('end'), this.get('employee_id'), this.get('position_id')], function (err, result) {
          if (!err) {
            _this.id = result.insertId;
          }

          cb(err);

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

        if (err) console.log(err);
        
        if (row) {
          _.keys(row).forEach( function (attr) {
            _this.set(attr, row[attr]);
          })

        } else {
          _this._notExists = true;
        }

        cb(err);

      });
    }
  },
  destroy: function (cb) {
    if (this.id) {
      var _this = this;
      db.querySingle(Queries.deleteById, [this.id], function (err, result) {

        cb(err);

      });
    }
  }

});
  
module.exports = ShiftModel;
