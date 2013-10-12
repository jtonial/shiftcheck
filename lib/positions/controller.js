var Main        = require(__basedir+'/helpers/global.js') ,
    _           = require('underscore')._ ,
    Model       = require('./model.js') ,
    Collection  = require('./collection.js') ;


exports.fetch = function (req, res) {

  var positions = new Collection ();

  positions.employer_id = req.user.employer_id;

  positions.fetch( function (err) {

    var response = {};

    if (err) {
      _.extend(response, err);
      response.statusCode = 500;
    } else {
      response.statusCode = 200;
      _.extend(response, { data: { positions: positions.toJSON() } });
    }
    Main.Render.code(req, res, response);
  })
};

exports.create = function (req, res) {
  console.log(req.body);
  var position = new Model({
    position    : req.body.position,
    full_name   : req.body.full_name,
    description : req.body.description,
    order       : req.body.order,
    employer_id : req.user.employer_id
  })

  position.save(function (err) {
    var response = {};

    if (err) {
      if (position._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;
    } else {
      response.statusCode   = 200;
      response.id           = position.id;
    }

    Main.Render.code(req, res, response )

  })

};

// This doesn't support PATCH methods right now; which I should really make it do
exports.update = function (req, res) {

  var position = req.position;

  // I should iterate through the body and only set/save the fields that have changed (and are present)
  position.set({
    position    : req.body.position,
    full_name   : req.body.full_name,
    description : req.body.description,
    order       : req.body.order,
    employer    : req.user.employer_id
  })

  position.save( function (err) {
    var response = {};

    if (err) {
      if (position._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;          
    } else {
      response.statusCode   = 200;
      response.data         = position.toJSON();
      // Or this could be _.extend(response, position.toJSON());
    }

    Main.Render.code(req, res, response )

  });
};

exports.delete = function (req, res) {

  var position = req.position;

  position.destroy( function (err, response) {

    Main.Render.code(req, res, response );

  })
};
