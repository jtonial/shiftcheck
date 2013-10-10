var Main        = require(__basedir+'/helpers/global') ,
    _           = require('underscore')._ ,
    Backbone    = require('backbone') ,
    db          = require(__basedir+'/db/mysql.js') ,
    async       = require('async') ,
    Queries     = require('./helpers/queries.js') ,
    ShiftCollection = require('./lib/shifts/collection.js') ;


var ScheduleModel = Backbone.Model.extend({

  defaults: {

  },

  validation: {
    employer_id  : {
      required: true
    },
    date   : {
      required: true
    },
    timezone: {
      required : true
    }
  },


  toJSON: function () {
    // I use the prototype so that I can possible rename this to toJSON later
    var json = Backbone.Model.prototype.toJSON.apply(this);
    if (this.Shifts) {
      _.extend(json, { Shifts: this.Shifts.toJSON() } );
    } else {
      _.extend(json, { Shifts: [] });
    }

    return json;
  },
  initialize: function () {
    
  },

  save: function (cb) {

    var errors = this.validate();

    if (!errors) {
      var _this = this;

      if (this.id) {
        // Update

        db.query(Queries.update, [ this.get('date'), this.get('timezone'), this.get('published'), this.id], function (err, result) {

          if (err) {
            Main.Logger.error(err);
            cb(err);
          } else {
            cb();
          }

        });
      } else {
        // Insert

        db.query(Queries.insert, [this.get('employer_id'), this.get('date'), this.get('timezone') ], function (err, result) {
          if (err) {
            Main.Logger.err(err);
            cb(err);
          } else {
            _this.id = result.insertId;

            cb();
          }

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
      if (_this.id) {
        db.querySingle(Queries.selectById, [ _this.id ], function (err, row) {
          if (err) {
            Main.Logger.error(err);
            cb(err);
          } else if (row) {
            _.keys(row).forEach( function (attr) {
              _this.set(attr, row[attr]);
            })

            var Shifts = new ShiftCollection();
            Shifts.schedule_id = _this.id;

            async.parallel([
              function (callback) {
                Shifts.fetch( function (err) {

                  _this.Shifts = Shifts;
                  
                  callback(err);

                });
              },
            ], function (err, result) {
              cb(err);
            });


          } else {
            _this._notExists = true;

            cb(err);
          }

        });
      } else {
        cb({ error: 'Schedule fetched with no id' });
      }
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
  
module.exports = ScheduleModel;
