var _         = require('underscore')._ ,
    Backbone  = require('backbone') ,
    db        = require(__basedir+'/db/mysql') ,
    Model     = require('./model.js') ,
    Queries   = require('./helpers/queries.js') ;

var PositionCollection = Backbone.Collection.extend({

  model: Model,

  initialize: function (models, args) {

  },

  fetch: function (cb) {

    var _this = this;

    db.query(Queries.selectPositions, [ this.employer_id ], function (err, rows) {

      if (!err) {
        _this.reset(); // Get rid of the empty object at the beginning
        _this.add(rows);
      }

      cb(err);

    });

  }

});

module.exports = PositionCollection;
