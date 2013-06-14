var Main        = require('../../helpers/global') ,
    db          = require('../../db/dbconnection') ,
    Queries     = require('./queries.js') ;

var Schedule = {

  data: {

  },
  validate: function () {

  },
  UTCify: function (date) {
    return new Date(date.getTime() + date.getTimezoneOffset()*60000);
  },
  unUTCify: function (date) {
    return new Date(date.getTime() - date.getTimezoneOffset()*60000);
  },
  generateUpdateQuery: function () {
    var sets = [];
    var vals = [];
    for (var key in this.data) {
      sets.push(key+'=');
      vals.push(this.data[key]);
    }
    var returnObject = {
      queryString : 'UPDATE schedules SET '+sets.join()+' WHERE schedule_id='+this.id,
      values    : vals
    }

    return returnObject;
  },
  generateInsertQuery: function () {
    if (this.data.image_loc != '') {
      var returnObject = {
        queryString : 'INSERT INTO schedules (employer_id, date, type, creation_time, image_loc, timezone, json) VALUES (?,?,?,NOW(),?,?,?)',
        values    : [this.data.employer_id, this.data.date, this.data.type, this.data.image_loc, this.data.timezone, this.data.json]
      }
    } else {
      var returnObject = {
        queryString : 'INSERT INTO schedules (employer_id, date, type, creation_time, image_loc, timezone, json, awaitingupload, published) VALUES (?,?,?,NOW(),?,?,?,0,1)',
        values    : [this.data.employer_id, this.data.date, this.data.type, this.data.image_loc, this.data.timezone, this.data.json]
      }
    }

    return returnObject;
  },
  save : function (cb) {
    if (Main.Config.debug) Main.Logger.info('Saving Schedule');

    var _this = this;

    if (typeof this.id == 'undefined') { //Create
      console.log('creating schedule');
      // Check for conflicting schedules
      var tmp = new Date(_this.data.date);
      var month = (1+parseInt(tmp.getMonth())) < 10 ? '0'+(1+parseInt(tmp.getMonth())) : (1+parseInt(tmp.getMonth()))
      var dateFormatted = tmp.getFullYear()+'-'+month+'-'+tmp.getDate();
      
      db.query(Queries.getScheduleByEmployerDate, [_this.data.employer_id, dateFormatted], function (err, row) {
        console.log('checked for date: '+_this.data.employer_id+' '+dateFormatted);
        console.log(row);
        if (err) {
          cb(err, null);
        } else {
          if (row.length) {
            cb( { error: 'CONFLICT', message: 'You cannot have multiple schedules for the same date. The conflicting schedule has id '+row[0].id }, null);
            return;
          }
          //No conflicting schedule exists, inserting
          var obj = _this.generateInsertQuery();

          if (Main.Config.debug) Main.Logger.info('Query object: '+JSON.stringify(obj));

          db.query(obj.queryString, obj.values, function (err, result) {
            if (!err) {
              //not method forEach of undefined
              var counter = _this.data.shifts.length;
              var failedFlag = false;
              if (counter) {
                _this.data.shifts.forEach( function (shift) {
                  // This should be a call to the shift model to insert it
                  db.query(Main.Queries.insertShift, [result.insertId, shift.start, shift.end, shift.position, shift.employee], function (err) {
                    if (err) {
                      failedFlag = true;
                      cb(err, null);
                    }
                    counter--;
                    if (counter == 0 && !failedFlag) {
                      cb(err, result);
                    }
                  });
                })
              } else {
                cb(err, result);
              }
            } else {
              cb(err, result);
            }
          });
        }
      })
      
    } else { //Update
      var obj = this.generateUpdateQuery();

      if (Main.Config.debug) Main.Logger.info('Query object: '+JSON.stringify(obj));

      db.query(obj.queryString, obj.values, cb);
    }

    return true;
  },
  delete : function (cb) {
    if (Main.Config.debug)Main.Logger.info('Updating Employee');
  }
};

exports.new = function (obj) {
  var tmp = Object.create(Schedule);

  if (typeof obj.employer_id != 'undefined') {
    tmp.data.employer_id = obj.employer_id;
  }
  if (typeof obj.date != 'undefined') {
    tmp.data.date = obj.date;
  }
  if (typeof obj.type != 'undefined') {
    tmp.data.type = obj.type;
  }
  if (typeof obj.creation_time != 'undefined') {
    tmp.data.creation_time = obj.creation_time;
  }
  if (typeof obj.image_loc != 'undefined') {
    tmp.data.image_loc = obj.image_loc;
  }
  if (typeof obj.shifts != 'undefined') {
    tmp.data.shifts = obj.shifts;
  }
  if (typeof obj.timezone != 'undefined') {
    tmp.data.timezone = obj.timezone;
  } else {
    tmp.data.timezone = 0;
  }
  if (typeof obj.json != 'undefined') {
    tmp.data.json = obj.json;
  }

  return tmp;
}
exports.verifyUpload = function (id, cb) {
  db.query(Queries.verifyUpload,[id], function (err, result) {
    var obj = {
      err      : err,
      result   : result
    }
    cb(obj);
  });
}
exports.getByEmployer = function (obj, cb) {

  var id       = obj.id;

  var response = {
    schedules: []
  };

  var _this = Schedule;

  //var today = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
  db.query(Queries.getSchedulesByEmployerFuture, [id, (new Date()).toISOString()], function (err, rows) {

    if (err) {
      Main.Logger.error(err);
      cb(err, null);
    } else {
      var totalRows = rows.length;
      if (totalRows) {

        var flag = false;
        var error = null;
        
        rows.forEach(function (row) {
          db.query(Main.Queries.getShiftsBySchedule, [row.id], function (err, shiftRows) {
            if (err) {
              console.log(err);
              error = err;
            } else {
              var newRow = row;
              newRow.shifts = shiftRows;
              /*shiftRows.forEach(function (shiftRow) {
                shiftRow.start = shiftRow.start))).toUTCString();
                shiftRow.end = shiftRow.end))).toUTCString();
                newRow.shifts.push(shiftRow);
              })*/
              if (newRow.shifts.length) {
                newRow.type = "shifted";
              } else if (newRow.json) {
                newRow.json = JSON.parse(newRow.json);
              }

              try {
                response.schedules.push(newRow);
              } catch (e) {
                Main.Logger.error('schedules.js - 275ish '+e);
              }
            }

            totalRows--;
            if (totalRows == 0) {
              cb(error, response);
            }

          })
        })
      } else {
        cb(err, response);
      }
    }
  });
}

exports.getByEmployerDate = function (obj, cb) {
  var id       = obj.id;
  var date     = obj.date;
  var response = {};

  db.query(Queries.getScheduleByEmployerDate, [id,date], function (err, row) {

    if (row[0]) {

      db.query(Main.Queries.getShiftsBySchedule, [row[0].id], function (err, shiftRows) {

        row[0].shifts = shiftRows;

        if (row[0].shifts.length) {
          row[0].type = "shifted";
        } else if (row[0].json) {
          row[0].type = "table";
          row[0].json = JSON.parse(row[0].json);
        }

        cb(err, row[0]);

      })
    } else {
      cb(err, null);
    }
  });
}
exports.getById = function (obj, cb) {
  var schedule_id = obj.schedule_id;
  var employer_id = obj.employer_id;

  db.query(Queries.selectById, [employer_id, schedule_id], function (err, row) {

    if (row[0]) {

      db.query(Main.Queries.getShiftsBySchedule, [row[0].id], function (err, shiftRows) {

        row[0].shifts = shiftRows;

        if (row[0].shifts.length) {
          row[0].type = "shifted";
        } else if (row[0].json) {
          row[0].type = "table";
          row[0].json = JSON.parse(row[0].json);
        }

        cb(err, row[0]);

      })
    } else {
      cb(err, null);
    }
  });
}

exports.publish = function (obj, cb) {
  var employer_id = obj.employer_id;
  var schedule_id = obj.schedule_id;

  db.query(Queries.publishSchedule, [schedule_id, employer_id], function (err, result) {
    var response = {};

    if (err) {
      response.statusCode = 500;
      response.message = err;
    } else {
      response.statusCode = 200;
    }

    cb(null, response);

  })
}

exports.unpublish = function (obj, cb) {
  var employer_id = obj.employer_id;
  var schedule_id = obj.schedule_id;

  db.query(Queries.unpublishSchedule, [schedule_id, employer_id], function (err, result) {
    var response = {};

    if (err) {
      response.statusCode = 500;
      response.message = err;
    } else {
      response.statusCode = 200;
    }

    cb(null, response);
    
  })
}

function validTimezone (t) {
  return ( t >= -720 && t <= 720 && t%30 == 0);
}
exports.update = function (obj, cb) {
  var employer_id = obj.employer_id;
  var schedule_id = obj.schedule_id;
  var timezone    = obj.timezone;  

  var response = {};

  if ( validTimezone(timezone) ) {

    db.query(Queries.updateTimezone, [timezone, schedule_id, employer_id], function (err, result) {

      if (err) {
        response.statusCode = 500;
        response.message    = err;
      } else {
        response.statusCode = 200;
      }

      cb(null, response);

    })
  } else {
    response.statusCode = 500;
    response.message    = 'Invalid timezone';

    cb(null, response);
  }
}
