var _         = require('underscore')._ ,
    Backbone  = require('backbone') ,
    db        = require(__basedir+'/db/dbconnection') ,
    Model     = require('./backbone-model.js') ,
    Queries   = require('./queries') ;

var PositionCollection = Backbone.Collection.extend({

  model: Model,

  initialize: function (models, args) {

  },

  fetch: function (cb) {

    var _this = this;

    db.query(Queries.selectEmployees, [ this.employer_id ], function (err, rows) {

      if (!err) {
        _this.reset(); // Get rid of the empty object at the beginning
        _this.add(rows);
      }

      cb(err);

    });

  }

});

module.exports = PositionCollection;
