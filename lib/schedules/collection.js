var Main        = require(__basedir+'/helpers/global') ,
    _           = require('underscore')._ ,
    Backbone    = require('backbone') ,
    db          = require(__basedir+'/db/mysql') ,
    async       = require('async') ,
    Schedule    = require('./model.js') ,
    Queries     = require('./helpers/queries.js') ,
    ShiftCollection = require('./lib/shifts/collection.js') ;


var ScheduleCollection = Backbone.Collection.extend({

  model: Schedule,

  initialize: function (models, args) {

  },

  fetch: function (cb) {

    var _this = this;

    if (_this.employer_id) {
      db.query(Queries.selectSchedulesFuture, [ _this.employer_id ], function (err, rows) {

        if (err) {
          cb(err);
        } else {
          _this.reset(); // Get rid of the empty object at the beginning

          async.each(rows, function (row, callback) {

            var schedule = new Schedule(row);

            var Shifts = new ShiftCollection();
            Shifts.schedule_id = schedule.id;

            async.parallel([
              function (callback) {
                Shifts.fetch( function (err) {

                  schedule.Shifts = Shifts;
                  
                  callback(err);

                });
              },
            ], function (err, result) {

              _this.add(schedule);

              callback(err);
            })
          }, function (err, result) {
            cb(err);
          })

        }

      });
    } else {
      cb({ error: 'Schedule Collection fetched with no employer_id' });
    }

  }

});

module.exports = ScheduleCollection;
