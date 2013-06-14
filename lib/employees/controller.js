var _       = require('underscore') ,
    Main    = require('../../helpers/global.js') ,
    Model   = require('./model.js') ,
    BackboneModel   = require('./backbone-model.js') ,
    Collection  = require('./collection.js') ;

exports.getEmployees = function (req, res) {

  //Passed in case I add search functionality in the API later (instead of just client side)
  var employees = new Collection ({});

  employees.employer_id = req.session.employer_id;

  employees.fetch( function (err) {

    var response = {};

    if (err) {
      _.extend(response, err);
      response.statusCode = 500;
    } else {
      response.statusCode = 200;
      _.extend(response, { data: { employees: employees.toJSON() } });
    }
    Main.Render.code(req, res, response);
  })
};

exports.addEmployee = function (req, res) {

  var salt = Main.Helpers.generateSalt();

  var employee = new BackboneModel({
    email       : req.body.email,
    username    : req.body.username,

    // Not sure if salt generation should be moved to the model
    password    : Main.Helpers.calcHash(req.body.password, salt),
    salt        : salt,

    first_name  : req.body.first_name,
    last_name   : req.body.last_name,

    employer_id : req.session.employer_id
  })

  employee.save(function (err, result) {
    var response = {};

    if (err) {
      if (employee._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;
    } else {
      response.statusCode   = 200;
      response.id           = employee.id;
    }

    Main.Render.code(req, res, response )

  })

};

// This doesn't support PATCH methods right now; which I should really make it do
exports.updateEmployee = function (req, res) {

  var employee = req.employee;

  // I should iterate through the body and only set/save the fields that have changed (and are present)
  employee.set({
    email       : req.body.email,
    username    : req.body.username,

    first_name  : req.body.first_name,
    last_name   : req.body.last_name,

    employer_id : req.session.employer_id
  })

  employee.save( function (err, result) {
    var response = {};

    if (err) {
      if (employee._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;          
    } else {
      response.statusCode   = 200;
      response.data         = employee.toPublicJSON();
      // Or this could be _.extend(response, employee.toJSON());
    }

    Main.Render.code(req, res, response )

  });
};

exports.deleteEmployee = function (req, res) {

  var employee = req.employee;

  employee.destroy( function (err, result) {
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



// --------- OLD STUFF ---------------
  // I should probably actually remove the bootstrap, at least for now

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
        Main.Render.code(req, res, obj);
      } else if ( typeof result == 'undefined' ) {
        var obj = {
          statusCode : 404,
          message : 'The employee does not seem to exist, or could not be found'
        }
        Main.Render.code(req, res, obj);
      } else {

        _.extend(response.data, result);

        Main.Models.Schedule.getByEmployer( { id: req.session.employer } , function (err, result2) {
          if (err) {
            var obj = {
              statusCode : 500,
              message : err.code
            }
            Main.Render.code(req, res, obj)
          } else {

            _.extend(response.data, result2);

            response.statusCode = 200;

            Main.Render.code(req, res, response);
          }
        });
      }
    })

  } else {
    var response = {
      statusCode: 403
    };
    Main.Render.code(req, res, response);
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
      Main.Render.code(req, res, response);
    });
  } else {
    response = {
      statusCode   : 400,
      message   : 'Invalid password'
    }
    Main.Render.code(req, res, response);
  }
};

