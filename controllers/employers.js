var Scheduleme = require('../helpers/global');

var _ = require('underscore');

exports.bootstrap = function(req, res){
  if (typeof req.session.employer_id != 'undefined') {//If an employer is signed in

    var response = {};
    response.data = {};

    Scheduleme.Models.Employer.fetch({ id : req.session.employer_id }, function (err, result) {

      if (err) {
        var obj = {
          statusCode : 500,
          message : err.code
        }
        Scheduleme.Helpers.Render.code(req.xhr, res, obj);
      } else if ( typeof result == 'undefined' ) {
        var obj = {
          statusCode : 404,
          message : 'The employer does not seem to exist, or could not be found'
        }
        Scheduleme.Helpers.Render.code(req.xhr, res, obj);
      } else {

        _.extend(response.data, result);

        Scheduleme.Models.Schedule.getByEmployer( { id : req.session.employer_id }, function (err, result2) {
          if (err) {
            var obj = {
              statusCode : 500,
              message : err.code
            }
            Scheduleme.Helpers.Render.code(req.xhr, res, obj)
          } else {

            _.extend(response.data, result2);

            response.statusCode = 200;

            Scheduleme.Helpers.Render.code(req.xhr, res, response);
          }
        });
      }
    });

    //});
  } else {
    response = {
      statusCode: 403
    };
    Scheduleme.Helpers.Render.code(req.xhr, res, response);
    console.log('Unauthorized access attempt: employer bootstrap');
  }
};
exports.processLogin = function (req, res) {
  Scheduleme.Models.Employer.login(req, res);
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

  Scheduleme.Models.Employer.create(obj, function (err, result) {
    var response = {};
    if (err) {
      response.statusCode = 500;
      response.message = err;
      console.log('Error: '+err);
      Scheduleme.Helpers.Render.code(req.xhr, res, response);
    } else {
      //log the user in; I could probably jsut set session stuff here
        //but doing a real log in will keep it consisten if stuff is changed
      Scheduleme.Models.Employer.login(req, res)
    }
  });
};
exports.changePassword = function (req, res) {

  if (Scheduleme.Helpers.helpers.validatePassword(req.body.newpassword)) {
    var input = {
      id       : req.session.employee_id,
      oldpassword : Scheduleme.Helpers.Helpers.calcHash(req.body.oldpassword),
      newpassword : Scheduleme.Helpers.Helpers.calcHash(req.body.newpassword),
    };
    Scheduleme.Models.Employee.changePassword(input, function (err) {
      response = {};
      if (err) {
        response.statusCode = 400;
      } else {
        response.statusCode = 200;
      }
      Scheduleme.Helpers.Render.code(req.xhr, res, response);
    });
  } else {
    response = {
      statusCode   : 400,
      message   : 'Invalid password'
    }
    Scheduleme.Helpers.Render.code(req.xhr, res, response);
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
  Scheduleme.Models.Employee.create(obj, function (err, result) {
    var response = {};
    if (err) {
      response.statusCode = 500;
      response.message = err.code;
      Scheduleme.Helpers.Render.code(req.xhr, res, response);
    } else {
      // I should probably return the id of the new employee so it can be fetched later
        // or return the full employee and the client can deal with it

      //for now...
      response.statusCode = 200;
      response.newEmployeeId = result.insertId;

      Scheduleme.Helpers.Render.code(req.xhr, res, response);
    }
  });
};
//This will load all employees for the given employer
exports.getEmployees = function (req, res) {

  //Passed in case I add search functionality in the API later (instead of just client side)
  var obj = {
    employer : req.session.employer_id || req.session.employer
  }

  Scheduleme.Models.Employee.getByEmployer (obj, function (err, response) {
    Scheduleme.Helpers.Render.code(req.xhr, res, response);
  })
};
exports.addPosition = function (req, res) {
  var obj = {
    position   : req.body.position,
    full_name  : req.body.full_name,
    description : req.body.description,
    employer   : req.session.employer_id
  }

  Scheduleme.Models.Employer.addPosition(obj, function (err, response) {
    if (err) {
      _.extend(response, err);
      response.statusCode = 500;
    }
    Scheduleme.Helpers.Render.code(req.xhr, res, response);
  })
};
exports.getPositions = function (req, res) {

  //Passed in case I add search functionality in the API later (instead of just client side)
  var obj = {
    employer : req.session.employer_id || req.session.employer
  }

  Scheduleme.Models.Employer.getPositions (obj, function (err, response) {
    if (err) {
      _.extend(response, err);
      response.statusCode = 500;
    }
    Scheduleme.Helpers.Render.code(req.xhr, res, response);
  })
};

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
      Scheduleme.Helpers.Render.code(req.xhr, res, response);
    }
  });
};

/* This function can update:
  - name
  - email
  - img
  - schedule_type
  - contact_info
*/
/*
exports.update = function(req, res) {
  console.log('Update Employer ID: '+req.params.id);
  var object = {};
  object = req.body;
  var numErrors = 0;
  if (typeof req.body.name != 'undefined') {
    if (typeof req.body.name == 'string') {
      object.name = req.body.name;
    } else {
      numErrors+=1;
    }
  }
  if (typeof req.body.email != 'undefined') {
    if (typeof req.body.email == 'string') {
      object.email = req.body.email;
    } else {
      numErrors+=1;
    }
  }
  if (typeof req.body.img != 'undefined') {
    if (typeof req.body.img == 'string') {
      object.img = req.body.img;
    } else {
      numErrors+=1;
    }
  }
  if (typeof req.body.schedule_type != 'undefined') {
    if (typeof req.body.schedule_type == 'string' &&
      (req.body.schedule_type == 'daily' ||
      req.body.schedule_type == 'weekly' ||
      req.body.schedule_type == 'monthly')) {
      object.schedule_type = req.body.schedule_type;
    } else {
      numErrors+=1;
    }
  }
  //Contact info validation
  if (typeof req.body.contact_info != 'undefined') {
    if (typeof req.body.contact_info.email != 'undefined') {
      if (typeof req.body.contact_info.email == 'string') {
        if (typeof object.contact_info == 'undefined') {
          object.contact_info = {};
        }
        object.contact_info.email = req.body.contact_info.email;
      } else {
        numErrors+=1;
      }
    }
    if (typeof req.body.contact_info.phone != 'undefined') {
      if (typeof req.body.contact_info.phone == 'string') {
        if (typeof object.contact_info == 'undefined') {
          object.contact_info = {};
        }
        object.contact_info.phone = req.body.contact_info.phone;
      } else {
        numErrors+=1;
      }
    }
    if (typeof req.body.contact_info.address != 'undefined') {
      if (typeof req.body.contact_info.address == 'string') {
        if (typeof object.contact_info == 'undefined') {
          object.contact_info = {};
        }
        object.contact_info.address = req.body.contact_info.address;
      } else {
        numErrors+=1;
      }
    }
  }

  if (numErrors === 0) {
    models.Employer.update( { _id:req.session.employerid },
      object , false, false, function(err) {
        if (!err) {
          res.statusCode = 201;
        } else {
          res.statusCode = 500;
          console.log('Error creating new positions: '+err);
        }
        res.end();
      });
  } else {
    res.statusCode = 400;
    res.end();
  }
};

exports.getPositions = function(req, res){
  //Get positions of the employer
};
exports.createPosition = function(req, res) {
  //Add a position(s) from the req.body to the positions array
  var new_positions = req.body.positions;

  models.Employer.update( { _id:req.session.employerid },
    {$addToSet: {positions: { $each: new_positions }}}, false, false, function(err) {
      if (!err) {
        res.statusCode = 201;
      } else {
        res.statusCode = 500;
        console.log('Error creating new positions: '+err);
      }
      res.end();
    });
};
exports.removePosition = function(req, res) {
  //Remove a position(s) from the req.body from the positions array (if the exist)
  var remove_positions = req.body.positions;

  models.Employer.update( { _id:req.session.employerid },
    {$pullAll: {positions: remove_positions}}, false, false, function(err) {
      if (!err) {
        res.statusCode = 200;
      } else {
        res.statusCode = 500;
        console.log('Error removing positions: '+err);
      }
      res.end();
    });

  //TODO: Remove the positions from any employee of the employer
};
exports.changePassword = function(req,res){
  if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
    //Update Password
    var oldPassword = calcHash(req.body.oldpassword);
    var newPassword = calcHash(req.body.newpassword);
    //Validate
    if (newPassword.length > 6) {
      models.Employer.update( { _id:req.session.employerid, password:oldPassword }, { password:newPassword }, { multi:false }, function(err, numAffected) {
        if (!err) {
          if (numAffected) {
            //Note that I am making the assumption that if there is no error, than a row was updated (not checking numAffected)
            console.log('Employer '+req.session.employerid+' password updated');
            res.statusCode = 200;
            res.end("Password Updated");
          } else {
            res.statusCode = 400;
            res.end();
          }
        } else { //An error
          Scheduleme.Helpers.Render.code500(req, res);
        }
      });
    } else {
      Scheduleme.Helpers.Render.code400(req, res);
    }
  } else {
    Scheduleme.Helpers.Render.code403(req, res);
    console.log('Unauthorized access attempt: create employee');
  }
};
exports.deleteEmployer = function(req, res) {
  if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
    //Post all of the employees shifts as up for grabs, and then remove him from the system
    console.log('Delete EmployerID: '+req.params.id);
    res.end("Employer - delete: Inactive at current time");
  } else {
    Scheduleme.Helpers.Render.code403(req, res);
    console.log('Unauthorized access attempt: delete employee');
  }
};
*/