var Main      = require('../../helpers/global') ,
    db        = require('../../db/dbconnection') ,
    Queries   = require('./queries.js') ;

exports.getPositions= function (obj, cb) {
  //Note: this is queries['selectEmployer']; I need to globalize this

  if (typeof obj.employer == 'undefined') {
    Main.Logger.info('No employer passed; Model.Employer.getPosition');
    //Exit here or something
    cb( { error: 'No employer passed to Employee::getByEmployer'}, {} );
    return;
  }

  var employer  = obj.employer;
  var response  = {};

  db.query(Queries.selectPositions, [employer], function (err, rows) {
    if (err) {
      response.statusCode = 500;
      response.message = err.code;
      Main.Logger.error(err.code);
      cb(err, response);
    } else {
      response.statusCode = 200;
      response.data = {};
      response.data.positions = [];

      rows.forEach (function (row) {
        response.data.positions.push(row);
      })

      cb(err, response);
    }
  });
}
exports.addPosition= function (obj, cb) {
  //Note: this is queries['selectEmployer']; I need to globalize this

  if (typeof obj.employer == 'undefined') {
    Main.Logger.info('No employer passed; lib/Position.addPosition');
    //Exit here or something
  }
  if (typeof obj.position == 'undefined') {
    Main.Logger.info('No position passed; lib/Position.addPosition');
    //Exit here or something
  }

  var employer    = obj.employer;
  var position    = obj.position;
  var full_name   = obj.full_name;
  var description = obj.description;
  var order       = obj.order;

  var response  = typeof obj.response != 'undefined' ? obj.response : {};

  db.query(Queries.insertPosition, [employer, position, full_name, description, order], function (err, result) {
    if (err) {
      response.statusCode = 500;
      response.message = err;
      Main.Logger.error(err);
      cb(err, response);
    } else {
      response.statusCode = 201;
      response.id = result.insertId;

      cb(err, response);
    }
  });
}

exports.deactivate= function (obj, cb) {
  //Note: this is queries['selectEmployer']; I need to globalize this

  if (typeof obj.position_id == 'undefined') {
    Main.Logger.info('No position passed; lib/Position.deactivate');
    //Exit here or something
  }

  var position    = obj.position_id;
  var employer    = obj.employer_id;

  var response  = typeof obj.response != 'undefined' ? obj.response : {};

  db.query(Queries.deactivatePosition, [position, employer], function (err, result) {
    if (err) {
      response.statusCode = 500;
      response.message = err;
      Main.Logger.error(err);
      cb(err, response);
    } else {
      response.statusCode = 200;

      cb(err, response);
    }
  });
}