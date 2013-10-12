
var Main            = require(__basedir+'/helpers/global.js') ,
    _               = require('underscore') ,
    User            = require('../auth/userModel.js') ,
    EmployeeCollection  = require('./collection.js') ;

exports.fetch = function (req, res) {

  //Passed in case I add search functionality in the API later (instead of just client side)
  var employees = new EmployeeCollection ();

  employees.employer_id = req.user.employer_id;

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

exports.create = function (req, res) {

  var employee = new User({
    first_name  : req.body.first_name,
    last_name   : req.body.last_name,
    email       : req.body.email,
    username    : req.body.username,
    password    : Main.Helpers.hash.calc(req.body.password),
    employer_id : req.user.employer_id
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

    // Send Registration Email
    // Main.Workers.push('shiftcheck_email', {
    //   action : 'email',
    //   object : 'employee',
    //   id     : employee.id,
    //   action_to_report : 'signup'
    // });

  })

};

// This doesn't support PATCH methods right now; which I should really make it do
exports.update = function (req, res) {

  var employee = req.employee;

  // I should iterate through the body and only set/save the fields that have changed (and are present)
  employee.set({
    email       : req.body.email,
    username    : req.body.username,

    first_name  : req.body.first_name,
    last_name   : req.body.last_name,

    employer_id : req.user.employer_id
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

exports.delete = function (req, res) {

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
