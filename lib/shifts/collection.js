var _         = require('underscore')._ ,
    Backbone  = require('backbone') ,
    db        = require('../../db/dbconnection') ,
    Model     = require('./model.js') ,
    Queries   = require('./queries') ;

// NOTE: Hasn't been tested or used at all
  // Doubt the query is written
  
var ShiftCollection = Backbone.Collection.extend({

  model: Model,

  initialize: function (models, args) {

  },

  fetch: function (cb) {

    var _this = this;

    if (_this.schedule_id) {
      db.query(Queries.getShiftsBySchedulePopulated, [ this.schedule_id ], function (err, rows) {


        if (err) {
          console.log(err);
        } else {
          _this.reset(); // Get rid of the empty object at the beginning
          _this.add(rows);
        }

        cb(err);

      });
    } else {
      Main.Logger.error('ShiftCollection created with no id');
      cb( { error: 'ShiftCollection created with no id' })
    }
  }

});

module.exports = ShiftCollection;
