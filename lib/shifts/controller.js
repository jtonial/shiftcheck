var Main  = require('../../helpers/global.js') ,
    Model = require('./model.js') ;

exports.addShift = function (req, res) {

  var shift = new Model({
    schedule_id : req.body.schedule_id,
    employee_id : req.body.employee_id,
    position_id : req.body.position_id,

    start       : req.body.start,
    end         : req.body.end
  })

  shift.save(function (err) {
    var response = {};

    if (err) {
      if (shift._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;
    } else {
      response.statusCode   = 200;
      response.id           = shift.id;
    }

    Main.Render.code(req, res, response )

  })

};

// This doesn't support PATCH methods right now; which I should really make it do
exports.updateShift = function (req, res) {

  var shift = req.shift;

  // I should iterate through the body and only set/save the fields that have changed (and are present)
  shift.set({
    employee_id : req.body.employee_id,
    position_id : req.body.position_id,
    start       : req.body.start,
    end         : req.body.end,
    employer_id : req.session.employer_id
  })

  shift.save( function (err) {
    var response = {};

    if (err) {
      if (shift._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;          
    } else {
      response.statusCode   = 200;
      response.data         = shift.toJSON();
      // Or this could be _.extend(response, shift.toJSON());
    }

    Main.Render.code(req, res, response )

  });
};

exports.deleteShift = function (req, res) {

  var shift = req.shift;

  shift.destroy( function (err) {
    var response = {};

    if (err) {
      response.statusCode = 500;
      response.error = err;
    } else {
      response.statusCode = 200;
    }

    Main.Render.code(req, res, response );

  })
};
