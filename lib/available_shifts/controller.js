var Main        = require(__basedir+'/helpers/global.js') ,
    _           = require('underscore')._ ,
    Model       = require('./model.js') ,
    Collection  = require('./collection.js') ,

    Shift       = require('../schedules/lib/shifts/model') ;


exports.fetch = function (req, res) {

  var available_shift = new Collection ();

  available_shift.employer_id = req.user.employer_id;

  available_shift.fetch( function (err) {

    var response = {};

    if (err) {
      response.statusCode = 500;
      response.error      = err;
    } else {
      response.statusCode = 200;
      response.data = { available_shift: available_shift.toJSON() };
    }

    Main.Render.code(req, res, response);

  });
};

/*
  Note: employee_id and employer_id are included for searchability - ie, avoid joins when fetching collections
*/
exports.create = function (req, res) {

  // This should actually fetch the shift information to populate the employee_id and employer_id
  var available_shift = new Model({
    shift_id    : req.body.shift_id,
    employee_id : req.body.employee_id,
    employer_id : req.body.employer_id,
    notes       : req.body.notes
  });

  available_shift.save(function (err) {
    var response = {};

    if (err) {
      if (available_shift._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;
    } else {
      response.statusCode   = 201;
      response.id           = available_shift.id;
    }

    Main.Render.code( req, res, response );

  });

};

// This doesn't support PATCH methods right now; which I should really make it do
exports.update = function (req, res) {

  var available_shift = req.available_shift;

  // I should iterate through the body and only set/save the fields that have changed (and are present)
  available_shift.set({
    notes       : req.body.notes
  });

  available_shift.save( function (err) {
    var response = {};

    if (err) {
      if (available_shift._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;
    } else {
      response.statusCode   = 200;
      response.data         = available_shift.toJSON();
      // Or this could be _.extend(response, request.toJSON());
    }

    Main.Render.code( req, res, response );

  });
};

exports.delete= function (req, res) {

  var available_shift = req.available_shift;

  available_shift.destroy( function (err) {

    var response = {};

    if (err) {
      response.statusCode = 500;
      reponse.error       = err.code;
      Main.Logger.error(err);
    } else {
      response.statusCode = 204;
    }

    Main.Render.code(req, res, response );

  });
};
