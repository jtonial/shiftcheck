var Main    = require('../../helpers/global') ,
    db      = require('../../db/dbconnection') ,
    Queries = require('./queries') ,
    _       = require('underscore') ;

var Employee = {

  data: {

  },
  save : function () {
    if (Main.Config.debug) Main.Logger.info('Saving Employee');
    return true;
  },
  update : function () {
    if (Main.Config.debug) Main.Logger.info('Updating Employee');
  },
  delete : function () {
    if (Main.Config.debug) Main.Logger.info('Updating Employee');
  },
  login : function (req, res) {
    var email = req.body.email;
    if (typeof email != 'undefined' && email != '' && typeof req.body.password != 'undefined') {
      var password = req.body.password;
      //Search object for account lookup
      var where = new Object();
      var loginQuery='';
      if (Main.Helpers.is_email(email)) {
        loginQuery = 'SELECT employee_id, password, salt, email, username, first_name, last_name, employer_id FROM employees WHERE email=? LIMIT 1';
        where.email = email;
      } else { //is username
        where.username = email;
        loginQuery = 'SELECT employee_id, password, salt, email, username, first_name, last_name, employer_id FROM employees WHERE username=? LIMIT 1';
      }

      var response = {};
      db.query(loginQuery, [email], function (err, row) {
        console.log('here1');
        if (err) {
          //Handle error, and 'end' event will be emitted after this.
          response.statusCode = 500;
          response.message = err.code;
          Main.Logger.error(err.code);
          Main.Render.code(req, res, response);
        } else {
          console.log('here2');
          if (row[0]) {
            console.log('here3');
            if (Main.Helpers.calcHash(password, row[0].salt) == row[0].password) {
              req.session.employee_id = row[0].employee_id;
              req.session.email       = row[0].email;
              req.session.username    = row[0].username;
              req.session.first_name  = row[0].first_name;
              req.session.last_name   = row[0].last_name;
              req.session.employer    = row[0].employer_id;

              response.statusCode     = 200;

              console.log('LOGGED IN');

              Main.Render.code(req, res, response);

              db.query(Queries.updateEmployeeLogin, [req.session.employee_id], function (err, numAffected) {
                if (err) {
                  Main.Logger.error('ERROR:: Updating employee login: '+err);
                }
              })
              //Track login
              var trackingInput = {
                type     : 'employee',
                id       : row[0].employee_id,
                ip       : Main.Helpers.getClientIp(req),
                statusCode  : response.statusCode
              };

              Main.Tracking.trackLogin(trackingInput);
            } else {
              Main.Logger.info("Failed login attempt for employer "+row[0].employee_id)
              response.statusCode = 400;
              Main.Render.code(req, res, response);  
            }
          } else {
            console.log('here5 - No rows returned');
            response.statusCode = 400;
            Main.Render.code(req, res, response);
          }
        }
      });
    } else {
      console.log('here7');
      var response = {
        statusCode : 400,
        message    : 'Email is missing or empty'
      }
      Main.Render.code(req, res, response);
    }
  }
};

exports.new = function (object) {
  return Object.create(Employee);
};
exports.create = function (obj, cb) {
  salt      = Main.Helpers.generateSalt();

  email     = obj.email;
  username  = obj.username;
  pass      = Main.Helpers.calcHash(obj.password, salt);
  fname     = obj.first_name
  lname     = obj.last_name;
  employer  = obj.employer_id;

  db.query(Queries.insertEmployee, [email, username, pass, salt, fname, lname, employer], cb)
};
exports.deactivate = function (obj, cb) {
  db.query(Queries.selectShiftsFuture, [ obj.employee_id ], function (err, rows) {
    if (err) { 
      response.statusCode = 500;
      response.message = err;
      Main.Logger.error(err);
      cb(err, response);
    } else if (rows.length) { // Future shifts use the position
      response.statusCode = 400;
      response.message = 'This employee has future shifts. Please correct this before deleting the employee.';
      cb(err, response);
    } else { // Okay to delete
      db.query(Queries.deactivateEmployee, [obj.employee_id, obj.employer_id], function (err, result) {
        /*if (err) {
          response.statusCode = 500;
          response.message = err;
          Main.Logger.error(err);
          cb(err, response);
        } else {
          response.statusCode = 200;

          cb(err, response);
        }*/
        cb(err, result);
      });
    }
  });

};
//Export static methods
exports.fetch = function (obj, cb, cb2) {
  //Note: this is queries['selectEmployer']; I need to globalize this

  if (typeof obj.employer == 'undefined') {
    Main.Logger.info('No employer passed');
    //Exit here or something
  }
  if (typeof obj.id == 'undefined') {
    Main.Logger.info('No id; Model.Employer.fetch');
  }

  id = obj.id;

  db.query(Queries.selectEmployee, [id], function (err, row) {
    
    response = {};

    if (err) {
      console.log(err.code);
      cb(err, response);
    } else {
      response = row[0];
    }

    cb(err, response);
  });
}
exports.getByEmployer = function (obj, cb) {
  //Note: this is queries['selectEmployer']; I need to globalize this
  if (typeof obj.employer == 'undefined') {
    Main.Logger.info('No employer passed');
    //Exit here or something
    cb( { error: 'No employer passed to Employee::getByEmployer'}, {} );
    return;
  }

  var employer   = obj.employer;
  var response   = typeof obj.response != 'undefined' ? obj.response : {};

  db.query(Queries.selectEmployees, [employer], function (err, rows) {
    if (err) {
      response.statusCode = 500;
      response.message = err.code;
      Main.Logger.error(err.code);
      cb(err, response);
    } else {
      response.statusCode = 200;
      response.data = {};
      response.data.employees = [];

      rows.forEach (function (row) {
        response.data.employees.push(row);
      })

      cb(err, response);
    }
  });
}
/*
  input = {
    id       => Employee id
    oldpassword => Employees old password
    newpassword => Employees new password
  }
*/
exports.changePassword = function (obj, cb) {

  //I should probably do some validation here
  db.query(Queries.changeEmployeePassword, [newpassword, id, oldpassword], cb);

}

exports.login = Employee.login;
