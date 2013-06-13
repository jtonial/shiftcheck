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
  
  var shift_id    = obj.shift_id;
  var employer_id = obj.employer_id;

  var employee_id = obj.employee_id;
  var position_id = obj.position_id;
  var start       = obj.start;
  var end         = obj.end;

  db.query(Queries.checkOwner, [ employer_id, shift_id ], function (err, rows) {
    if (!err && rows && rows.length) {
      var params = Queries.checkEmployeeShift.params(employee_id, shift_id, start, end);
      db.query(Queries.checkEmployeeShift.query, params, function (err, rows) {
        if (err) {
          cb( { error : err }, null );
        } else if (rows && rows.length) {
          cb( { error : 'Employee '+employee_id+' has a conflicting shift' }, null);
        } else {
          db.query(Queries.update, [ employee_id, position_id, start, end, shift_id ], function (err, result) {
            if (err) {
              cb( { error : err }, null );
            } else {
              cb( null, null );
            }
          })
        }
      })
    } else {
      cb( { error : 'You do not have a shift with id '+shift_id }, null);
    }
  })
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
