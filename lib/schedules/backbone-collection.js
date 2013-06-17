var Main      = require(__basedir+'/helpers/global') ,
    _         = require('underscore')._ ,
    Backbone  = require('backbone') ,
    db        = require(__basedir+'/db/dbconnection') ,
    Model     = require('./backbone-model.js') ,
    Queries   = require('./backbone-queries') ,
    ShiftCollection = require('../shifts/collection') ;


var ScheduleCollection = Backbone.Collection.extend({

  model: Model,

  initialize: function (models, args) {

  },

  fetch: function (cb) {

    var _this = this;

    db.query(Queries.selectSchedulesFuture, [ this.employer_id ], function (err, rows) {

      if (err) {
        cb(err);
      } else {
        _this.reset(); // Get rid of the empty object at the beginning

        var totalRows = rows.length;
        if (totalRows) {
          
          var errors = [];

          rows.forEach(function (row) {

            var s = new Model(row);

            s.Shifts = new ShiftCollection({});
            s.Shifts.schedule_id = row.id;

            s.Shifts.fetch( function (err) {

              if (err) {
                errors.push(err);
              } else {

                if (s.Shifts.length) {
                  s.set('type', 'shifted');
                } else if (s.get('json')) {
                  s.set('type', 'table');
                  s.set('json', JSON.parse(s.get('json')));
                }
              }

              _this.add(s);

              totalRows--;

              if (totalRows == 0) {
                if (_.isEmpty(errors)) {
                  cb(null);
                } else {
                  cb(errors);
                }
              }
            });
            
          });

        } else {
          cb(err, response);
        }
      }

    });

  }

});

module.exports = ScheduleCollection;
