var Main        = require(__basedir+'/helpers/global.js') ,
    _           = require('underscore')._ ,
    Model       = require('./model.js') ,
    Collection  = require('./collection.js') ,

    States      = require('./helpers/states') ;


exports.fetch = function (req, res) {

  var requests = new Collection ();

  requests.employer_id = req.user.employer_id;

  requests.fetch( function (err) {

    var response = {};

    if (err) {
      _.extend(response, err);
      response.statusCode = 500;
    } else {
      response.statusCode = 200;
      _.extend(response, { data: { requests: requests.toJSON() } });
    }
    Main.Render.code(req, res, response);
  });
};

exports.create = function (req, res) {

  var request = new Model({
    available_shift_id : req.body.available_shift_id,
    from_employee   : req.body.from_employee,
    to_employee     : req.body.to_employee,
    notes           : req.body.notes
  });

  request.save(function (err) {
    var response = {};

    if (err) {
      if (request._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;
    } else {
      response.statusCode   = 201;
      response.id           = request.id;
    }

    Main.Render.code( req, res, response );

  });

};

// This doesn't support PATCH methods right now; which I should really make it do
exports.update = function (req, res) {

  var request = req.request;

  var newState = req.body.state;

  var stateChanged = false;

  if (request.get('state') != newState) stateChanged = true;

  if (stateChanged && !States.validTransition(request.get('state'), newState)) { // Perhaps the model should enforce this check internally
    console.log('Invalid state change from '+request.get('state')+' to '+newState);
    response = {
      statusCode : 400,
      error      : 'Invalid state transition'
    };
    Main.Render.code( req, res, response );
    return 0;
  }

  var response_by;

  if (States.toString(newState) == 'Approved' || States.toString(newState) == 'Rejected' ) {
    response_by = req.user.user_id;
  }

  request.set({
    state       : newState,
    response_by : response_by,
    response_time : Date(),
    notes       : req.body.notes
  });

  request.save( function (err) {

    if (stateChanged && States.toString(newState) == 'Approved') {
      // Find and update the shift model
      // Find and destroy the AvailableShift model
      // Find and reject all ChangeRequets with the same available_shift_id (and trigger any notifications)
    }
    var response = {};

    if (err) {
      if (request._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;
    } else {
      response.statusCode   = 200;
      response.data         = request.toJSON();
      // Or this could be _.extend(response, request.toJSON());
    }

    Main.Render.code( req, res, response );

  });
};

exports.delete = function (req, res) {

  var request = req.request;

  // request.destroy( function (err, response) {

  //   var response = {};

  //   if (err) {
  //     response.statusCode = 500;
  //     reponse.error       = err.code;
  //   } else {
  //     response.statusCode = 204;
  //   }
    
  //   Main.Render.code( req, res, response );

  // });

  Main.Render.code( req, res, { statusCode : 405 } );

};
