var Main = require('../../helpers/global.js') ,
    Shift = require('./model.js') ;

exports.addShift = function (req, res) {
  var obj = {
    employer_id : req.session.employer_id,
    
    schedule_id : req.body.schedule_id,
    employee_id : req.body.employee_id,
    position_id : req.body.position_id,

    start       : req.body.start,
    end         : req.body.end
  }
  
  Shift.create(obj, function (err, result) {
    if (err) {
      var response = {
        statusCode : 400,
        error      : err
      }
    } else {
      var response = {
        statusCode : 200,
        id         : result.id
      }
    }

    Main.Helpers.Render.code( req.xhr, res, response );

  })

}