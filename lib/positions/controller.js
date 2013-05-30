var Main      = require('../../helpers/global.js') ,
    Position  = require('./model.js') ,
    _         = require('underscore') ;

exports.addPosition = function (req, res) {
  var obj = {
    position    : req.body.position,
    full_name   : req.body.full_name,
    description : req.body.description,
    order       : req.body.order,
    employer    : req.session.employer_id
  }

  Position.addPosition(obj, function (err, response) {
    if (err) {
      _.extend(response, err);
      response.statusCode = 500;
    }
    Main.Render.code(req.xhr, res, response);
  })
};
exports.getPositions = function (req, res) {

  //Passed in case I add search functionality in the API later (instead of just client side)
  var obj = {
    employer : req.session.employer_id || req.session.employer
  }

  Position.getPositions (obj, function (err, response) {
    if (err) {
      _.extend(response, err);
      response.statusCode = 500;
    }
    Main.Render.code(req.xhr, res, response);
  })
};

exports.updatePositions = function (req, res) {

}

exports.deactivatePosition = function (req, res) {
  var obj = {
    position_id : req.params.id,
    employer_id : req.session.employer_id
  }

  Position.deactivate(obj, function (err, response) {
    if (err) {
      _.extend(response, err);
      response.statusCode = 500;
    }
    Main.Render.code(req.xhr, res, response);
  })
}