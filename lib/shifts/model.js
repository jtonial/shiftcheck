var Queries = require('./queries.js') ,
    db = require('../../db/dbconnection.js') ;


exports.create = function (obj, cb) {
  db.query(Queries.checkSchedule, [obj.employer_id, obj.schedule_id], function (err, rows) {
    if (!err && rows && rows.length) {
      db.query(Queries.insert, [obj.schedule_id, obj.start, obj.end, obj.employee_id, obj.position_id], function (err, result) {
        if (err) {
          cb( { error : err }, null);
        } else {
          cb( null, { id: result.insertId })
        }
      })
    } else {
      cb( { error : 'You do not have a schedule with id '+obj.schedule_id }, null);
    }
  })
}