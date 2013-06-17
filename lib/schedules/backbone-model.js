var Main        = require(__basedir+'/helpers/global') ,
    _           = require('underscore')._ ,
    Backbone    = require('backbone') ,
    db          = require(__basedir+'/db/dbconnection') ,
    Queries     = require('./backbone-queries') ,
    ShiftCollection = require('../shifts/collection') ;


var PositionModel = Backbone.Model.extend({

  defaults: {

  },

  schema: {
    employer_id: {
      required  : true,
      protected : true,
      public    : true
    },
    date: {
      required  : true,
      protected : false,
      public    : true
    },
    timezone: {
      required  : true,
      protected : false,
      public    : true
    },
    type: {
      required  : true,
      protected : false,
      public    : true
    }
  },

  validate: function (attrs, options) {
    var errors = [];
    var _this = this;
    /*
      Validate required fields
    */
    _.keys(_this.schema).forEach( function (attr) {
      if (_this.schema[attr].required) {
        if (typeof _this.get(attr) == 'undefined') {
          errors.push(attr+' is a required field');
        }
      }
    })

    /*
      Here is where I need to validate employee shift overlap
    */
    if (!_.isEmpty(errors)) return errors;
  },

  toJSON: function () {
    // I use the prototype so that I can possible rename this to toJSON later
    var json = Backbone.Model.prototype.toJSON.apply(this);
    _.extend(json, { Shifts: this.Shifts.toJSON() } );

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

        db.query(Queries.update, [ this.get('position'), this.get('full_name'), this.get('description'), this.get('order'), this.id], function (err, result) {

          if (err) {
            Main.Logger.error(err);
            cb(err);
          } else {
            var errors = [];
            var totalItems = _this.Items.length;
            if (totalShifts) {
              // Loop through the order item collection and update each one (if changed)
              _this.Items.forEach( function (item) {
                item.save( function (err) {
                  if (err) {
                    Main.Logger.error(err);
                    errors.push(err);
                  }

                  totalItems--;

                  if (totalItems == 0) {
                    if (_.isEmpty(errors)) {
                      cb(null);
                    } else {
                      cb(errors);
                    }
                  }
                })
              })
            } else {
              cb(null);
            }
          }

        });
      } else {
        // Insert

        var query = this.get('image_loc') ? Queries.insertWithImage : Queries.insert;

        db.query(query, [this.get('employer_id'), this.get('date'), this.get('type'), this.get('image_loc'), this.get('timezone'), this.get('json')], function (err, result) {
          if (err) {
            Main.Logger.err(err);
            cb(err);
          } else {
            _this.id = result.insertId;

            var errors = [];
            var totalShifts = _this.Shifts.length;
            if (totalShifts) {
              // Loop through the shift collection and update each one (if changed)
              _this.Shifts.forEach( function (shift) {

                shift.set('schedule_id', _this.id);

                shift.save( function (err) {
                  if (err) {
                    Main.Logger.error(err);
                    errors.push(err);
                  }

                  totalShifts--;

                  if (totalShifts == 0) {
                    if (_.isEmpty(errors)) {
                      cb(null);
                    } else {
                      cb(errors);
                    }
                  }
                })
              })
            } else {
              cb(null);
            }
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
      db.querySingle(Queries.selectById, [ _this.id ], function (err, row) {
        if (err) {
          Main.Logger.error(err);
          cb(err);
        } else if (row) {
          _.keys(row).forEach( function (attr) {
            _this.set(attr, row[attr]);
          })

          _this.Shifts = new ShiftCollection();
          _this.Shifts.schedule_id = _this.id;

          _this.Shifts.fetch( function (err) {

            if (!err) {

              if (_this.Shifts.length) {
                _this.set('type', 'shifted');
              } else if (_this.get('json')) {
                _this.set('type', 'table');
                _this.set('json', JSON.parse(_this.get('json')));
              }
            }

            cb(err);

          })

        } else {
          _this._notExists = true;

          cb(err);
        }

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