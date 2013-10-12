var Main        = require(__basedir+'/helpers') ,
    _           = require('underscore')._ ,
    Backbone    = require('backbone') ,
    validation  = require('backbone-validation') ,
    db          = require(__basedir+'/db/mysql.js') ,
    Queries     = require('./helpers/queries.js') ;


var PositionModel = Backbone.Model.extend({

  defaults: {

  },

  validation: {
    employer_id : {
      required: true
    },
    position : {
      required : true
    },
    full_name : {
      required: true
    },
    description : {
      required: true
    },
    order : {
      required: true
    }
  },

  save: function (cb) {

    var errors = this.validate();

    if (!errors) {
      var _this = this;

      if (this.id) {
        // Update

        db.query(Queries.update, [ this.get('position'), this.get('full_name'), this.get('description'), this.get('order'), this.id], function (err, result) {

          cb(err, result);
          // OR
          // cb(_this);
        });
      } else {
        // Insert

        db.query(Queries.insert, [this.get('employer_id'), this.get('position'), this.get('full_name'), this.get('description'), this.get('order')], function (err, result) {
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
      cb({ error: 'Position fetched with no id' });
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
          response.message = 'This position is used in future schedules. Please remove it before deleting the position.';
          cb(err, response);
        } else { // Okay to delete

          db.querySingle(Queries.deactivate, [ _this.id ], function (err, result) {

            if (err) {
              response.statusCode = 500;
              response.message = err;
              Main.Logger.error(err);
            } else {
              response.statusCode = 200;
            }
            
            cb(err, response);

          });
        }
      });
    }

  }

});
  
module.exports = PositionModel;
