var Main  = require('../../helpers/global.js') ,
    Model = require('./model.js') ;

exports.addShift = function (req, res) {
  var obj = {
    employer_id : req.session.employer_id,
    
    schedule_id : req.body.schedule_id,
    employee_id : req.body.employee_id,
    position_id : req.body.position_id,

    start       : req.body.start,
    end         : req.body.end
  }
  
  Model.create(obj, function (err, result) {
    if (err) {
      var response = {
        statusCode : 500,
        error      : err
      }
    } else {
      var response = {
        statusCode : 200,
        id         : result.id
      }
    }

    Main.Render.code( req.xhr, res, response );

  })

};

exports.updateShift = function (req, res) {
  res.end();
};

exports.deleteShift = function (req, res) {

  var obj = {
    shift_id    : req.params.id,
    employer_id : req.session.employer_id
  }

  Model.delete(obj, function (err, result) {
    if (err) {
      var response = {
        statusCode : 500,
        error      : err
      }
    } else {
      var response = {
        statusCode : 200
      }
    }

    Main.Render.code( req.xhr, res, response );

  })
};
