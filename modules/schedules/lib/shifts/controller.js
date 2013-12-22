var Main        = require(__basePath+'/main.js') ,
    Shift       = require('./model.js') ;

exports.create = function (req, res) {

  var shift = new Shift({
    schedule_id : req.params.schedule_id,
    employee_id : req.body.employee_id,
    position_id : req.body.position_id,

    start       : req.body.start,
    end         : req.body.end
  });

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
      response.statusCode   = 201;
      response.id           = shift.id;
    }

    Main.Render.code(req, res, response );

  });

};

// This doesn't support PATCH methods right now; which I should really make it do
exports.update = function (req, res) {

  var shift = req.shift;

  // I should iterate through the body and only set/save the fields that have changed (and are present)
  shift.set({
    employee_id : req.body.employee_id,
    position_id : req.body.position_id,
    start       : req.body.start,
    end         : req.body.end
  });

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

    Main.Render.code(req, res, response );

  });
};

exports.delete = function (req, res) {

  var shift = req.shift;

  shift.destroy( function (err) {
    var response = {};

    if (err) {
      response.statusCode = 500;
      response.error = err;
    } else {
      response.statusCode = 204;
    }

    Main.Render.code( req, res, response );

  });
};
