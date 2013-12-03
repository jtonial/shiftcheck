var _           = require('underscore')._ ,
    Backbone    = require('backbone') ,
    validation  = require('backbone-validation') ,
    db          = require(__basedir+'/connections/mysql.js') ,
    Queries     = require('./helpers/queries.js') 

    States      = require('./helpers/states') ;


var ChangeRequestModel = Backbone.Model.extend({

  defaults: {

  },

  validation: {
    available_shift_id : {
      required: true
    },
    from_employee : {
      required : true
    },
    to_employee : {
      required: true
    }
  },

  save: function (cb) {

    var errors = this.validate();

    if (!errors) {
      var _this = this;

      if (this.id) {
        // Update

        db.query(Queries.update, [ this.get('state'), this.get('response_by'), this.get('response_time'), this.get('notes'), this.id], function (err, result) {

          cb(err, result);
          // OR
          // cb(_this);
        });
      } else {
        // Insert

        db.query(Queries.insert, [this.get('available_shift_id'), this.get('from_employee'), this.get('to_employee'), this.get('notes') ], function (err, result) {
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
          });

          _this.set('state_text', States.toString(_this.get('state')));

        } else {
          _this._notExists = true;
        }

        cb(err);

      });
    } else {
      cb({ error: 'Change Request fetched with no id' });
    }
  }

});
  
module.exports = ChangeRequestModel;
