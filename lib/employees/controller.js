var Main    = require('../../helpers/global') ,
    Model   = require('./model') ,
    _       = require('underscore') ;

exports.bootstrap = function(req, res){
  if (typeof req.session.employee_id != 'undefined') {//If an employer is signed in

    var response = {};
    response.data = {};
    
    var input = {
      id        : req.session.employee_id,
      employer  : req.session.employer
    }

    Main.Models.Employee.fetch( input , function (err, result) {

      if (err) {
        var obj = {
          statusCode : 500,
          message : err.code
        }
        Main.Render.code(req.xhr, res, obj);
      } else if ( typeof result == 'undefined' ) {
        var obj = {
          statusCode : 404,
          message : 'The employee does not seem to exist, or could not be found'
        }
        Main.Render.code(req.xhr, res, obj);
      } else {

        _.extend(response.data, result);

        Main.Models.Schedule.getByEmployer( { id: req.session.employer } , function (err, result2) {
          if (err) {
            var obj = {
              statusCode : 500,
              message : err.code
            }
            Main.Render.code(req.xhr, res, obj)
          } else {

            _.extend(response.data, result2);

            response.statusCode = 200;

            Main.Render.code(req.xhr, res, response);
          }
        });
      }
    })

  } else {
    var response = {
      statusCode: 403
    };
    Main.Render.code(req.xhr, res, response);
    console.log('Unauthorized access attempt: employee bootstrap');
  }
};
exports.processLogin = function (req, res) {
  Main.Models.Employee.login(req, res);
};
exports.changePassword = function (req, res) {

  if (Main.Helpers.helpers.validatePassword(req.body.newpassword)) {
    var input = {
      id       : req.session.employee_id,
      oldpassword : Main.Helpers.helpers.calcHash(req.body.oldpassword),
      newpassword : Main.Helpers.helpers.calcHash(req.body.newpassword),
    };
    Main.Models.Employee.changePassword(input, function (err) {
      response = {};
      if (err) {
        response.statusCode = 400;
      } else {
        response.statusCode = 200;
      }
      Main.Render.code(req.xhr, res, response);
    });
  } else {
    response = {
      statusCode   : 400,
      message   : 'Invalid password'
    }
    Main.Render.code(req.xhr, res, response);
  }
};

exports.addEmployee = function (req, res) {
  console.log(req.body);

  // Validate body
  var obj = {
    email       : req.body.email,
    username    : req.body.username,
    password    : req.body.password,
    first_name  : req.body.first_name,
    last_name   : req.body.last_name,
    employer_id : req.session.employer_id
  };

  Model.create(obj, function (err, result) {
    var response = {};
    if (err) {
      response.statusCode = 500;
      response.message = err.code;
      Main.Render.code(req.xhr, res, response);
    } else {
      // I should probably return the id of the new employee so it can be fetched later
        // or return the full employee and the client can deal with it

      //for now...
      response.statusCode = 200;
      response.newEmployeeId = result.insertId;

      Main.Render.code(req.xhr, res, response);
    }
  });
};

exports.deleteEmployee = function (req, res) {

  var obj = {
    employee_id : req.params.id,
    employer_id : req.session.employer_id
  };

  Model.deactivate(obj, function (err, result) {
    Main.Render.code(req.xhr, res, result);
  });
};
