var _           = require('underscore')._ ,
    Backbone    = require('backbone') ,
    validation  = require('backbone-validation') ,
    db          = require(__basePath+'/connections/mysql.js') ,
    Queries     = require('./helpers/queries.js') ;


var AvailableShiftModel = Backbone.Model.extend({

  defaults: {

  },

  validation: {
    shift_id : {
      required: true
    },
    employee_id : {
      required : true
    },
    employer_id : {
      required: true
    }
  },

  save: function (cb) {

    var errors = this.validate();

    if (!errors) {
      var _this = this;

      if (this.id) {
        // Update

        db.query(Queries.update, [ this.get('notes'), this.id], function (err, result) {

          cb(err, result);
          // OR
          // cb(_this);
        });
      } else {
        // Insert

        db.query(Queries.insert, [this.get('shift_id'), this.get('notes'), this.get('employee_id'), this.get('employer_id') ], function (err, result) {
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
      db.querySingle(Queries.selectById, [ _this.id ], function (err, row) {

        if (err) Main.Logger.error(err);
        
        if (row) {
          _.keys(row).forEach( function (attr) {
            _this.set(attr, row[attr]);
          })

        } else {
          _this._notExists = true;
        }

        cb(err);

      });
    } else {
      cb({ error: 'AvailableShift fetched with no id' });
    }
  },
  destroy: function (cb) {
    if (this.id) {
      var _this = this;
      db.querySingle(Queries.destroy, [ _this.id ], function (err, row) {

        if (err) {
          Main.Logger.error(err);
        }

        cb(err);

      });
    } else {
      cb({ error: 'AvailableShift destroyed with no id' });
    }
  }

});
  
module.exports = AvailableShiftModel;
