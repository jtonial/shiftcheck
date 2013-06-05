var db          = require('../../db/dbconnection.js') ,
    Queries     = require('./queries.js') ;

var validate = function (obj) {
  var errors = [];

  if (obj.end <= obj.start) {
    errors.push('Shift cannot end before it begins');
  }

  return errors;
};

exports.create = function (obj, cb) {
  var errors = validate(obj);
  if (!errors.length) {
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
  } else {
    cb( { error : errors }, null);
  }
}

exports.update = function (obj, cb) {
  
}

exports.delete = function (obj, cb) {

  var shift_id    = obj.shift_id;
  var employer_id = obj.employer_id;

  db.query(Queries.checkOwner, [ employer_id, shift_id ], function (err, rows) {
    if (!err && rows && rows.length) {
      db.query(Queries.delete, [ shift_id ], function (err, result) {
        if (err) {
          cb( { error : err }, null );
        } else {
          cb( null, null );
        }
      })
    } else {
      cb( { error : 'You do not have a shift with id '+shift_id }, null);
    }
  })
}
