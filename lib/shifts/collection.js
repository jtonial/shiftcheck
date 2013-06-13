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

    db.query(Queries.getShiftsBySchedulePopulated, [ this.schedule_id ], function (err, rows) {

      if (!err) {
        _this.reset(); // Get rid of the empty object at the beginning
        _this.add(rows);
      }

      cb(err);

    });

  }

});

module.exports = ShiftCollection;
