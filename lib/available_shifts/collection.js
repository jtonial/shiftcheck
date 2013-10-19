var _         = require('underscore')._ ,
    Backbone  = require('backbone') ,
    db        = require(__basedir+'/db/mysql') ,
    Model     = require('./model.js') ,
    Queries   = require('./helpers/queries.js') ;

var AvailableShiftCollection = Backbone.Collection.extend({

  model: Model,

  initialize: function (models, args) {

  },

  fetch: function (cb) {

    var _this = this;

    if (_this.employee_id) {
      db.query(Queries.selectRequestsByEmployee, [ this.employee_id ], function (err, rows) {

        if (!err) {
          _this.reset(); // Get rid of the empty object at the beginning
          _this.add(rows);
        }

        cb(err);

      });
    } else if (_this.employer_id) {
      db.query(Queries.selectRequestsByEmployer, [ this.employer_id ], function (err, rows) {

        if (!err) {
          _this.reset(); // Get rid of the empty object at the beginning
          _this.add(rows);
        }

        cb(err);

      });
    } else {
      cb({ error: 'AvailableShift Collection fetched with no id' });
    }

  }

});

module.exports = AvailableShiftCollection;
