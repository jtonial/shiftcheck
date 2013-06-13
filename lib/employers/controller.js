var Main = require('../../helpers/global');

var _ = require('underscore');

exports.bootstrap = function(req, res){
  if (typeof req.session.employer_id != 'undefined') {//If an employer is signed in

    var response = {};
    response.data = {};

    Main.Models.Employer.fetch({ id : req.session.employer_id }, function (err, result) {

      if (err) {
        var obj = {
          statusCode : 500,
          message : err.code
        }
        Main.Render.code(req, res, obj);
      } else if ( typeof result == 'undefined' ) {
        var obj = {
          statusCode : 404,
          message : 'The employer does not seem to exist, or could not be found'
        }
        Main.Render.code(req, res, obj);
      } else {

        _.extend(response.data, result);

        Main.Models.Schedule.getByEmployer( { id : req.session.employer_id }, function (err, result2) {
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
    });

    //});
  } else {
    response = {
      statusCode: 403
    };
    Main.Render.code(req, res, response);
    console.log('Unauthorized access attempt: employer bootstrap');
  }
};
exports.processLogin = function (req, res) {
  Main.Models.Employer.login(req, res);
};
exports.processSignup = function (req, res) {
  
  // Validate body

  // This uses the basic salt and doesn't save it to the DB. I need to fix this
    // Pass unhashed passed work to model, model makes salt and then hashes passsword
  var obj = {
    name            : req.body.name,
    email           : req.body.email,
    username        : req.body.username,
    password        : req.body.password,
    contact_email   : req.body.contact.email,
    contact_phone   : req.body.contact.phone,
    contact_address : req.body.contact.address
  }

  Main.Models.Employer.create(obj, function (err, result) {
    var response = {};
    if (err) {
      response.statusCode = 500;
      response.message = err;
      console.log('Error: '+err);
      Main.Render.code(req, res, response);
    } else {
      //log the user in; I could probably jsut set session stuff here
        //but doing a real log in will keep it consisten if stuff is changed
      Main.Models.Employer.login(req, res)
    }
  });
};
exports.changePassword = function (req, res) {

  if (Main.Helpers.validatePassword(req.body.newpassword)) {
    var input = {
      id       : req.session.employee_id,
      oldpassword : Main.Helpers.calcHash(req.body.oldpassword),
      newpassword : Main.Helpers.calcHash(req.body.newpassword),
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

// DELETED addPosition and getPositions, as they have been moved to positions lib

exports.create = function(req, res){
  //TODO: Validation; same as client side
  
  var name = req.body.name;
  var email = req.body.email;
  var password = calcHash(req.body.password);
  var positions = req.body.positions;
  var company_email = req.body.company_email;
  var company_phone = req.body.company_phone;
  var company_address = req.body.company_address;

  //TODO: Validate email (function can be taken from another project)
  var query = 'INSERT INTO employers (name, email, password, company_email, company_phone, company_address) VALUES (?,?,?,?,?,?)';
  db.query(query, [name, email, password, company_email, company_phone, company_address], function (err, result) {
    var response = Object();
    if (!err) {
      response.statusCode = 201;
      response.data = Object();
      response.data.id = result.insertId;
      //Insert positions
      res.statusCode = 201;
    } else {
      console.log('Error: employer: insert: '+err);
      response.statusCode = 400;
      response.message = err.code;
      Main.Render.code(req, res, response);
    }
  });
};
