var _         = require('underscore')._ ,
    Backbone  = require('backbone') ,
    db        = require(__basedir+'/connections/mysql') ,
    Model     = require('../auth/userModel.js') ,
    Queries   = require('./queries') ;

var EmployeeCollection = Backbone.Collection.extend({

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

module.exports = EmployeeCollection;
