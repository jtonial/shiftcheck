var Scheduleme = require('../helpers/global');

var _ = require('underscore');

exports.bootstrap = function(req, res){
  if (typeof req.session.employee_id != 'undefined') {//If an employer is signed in

    var response = {};
    response.data = {};
    
    var input = {
      id        : req.session.employee_id,
      employer  : req.session.employer
    }

    Scheduleme.Models.Employee.fetch( input , function (err, result) {

      if (err) {
        var obj = {
          statusCode : 500,
          message : err.code
        }
        Scheduleme.Render.code(req.xhr, res, obj);
      } else if ( typeof result == 'undefined' ) {
        var obj = {
          statusCode : 404,
          message : 'The employee does not seem to exist, or could not be found'
        }
        Scheduleme.Render.code(req.xhr, res, obj);
      } else {

        _.extend(response.data, result);

        Scheduleme.Models.Schedule.getByEmployer( { id: req.session.employer } , function (err, result2) {
          if (err) {
            var obj = {
              statusCode : 500,
              message : err.code
            }
            Scheduleme.Render.code(req.xhr, res, obj)
          } else {

            _.extend(response.data, result2);

            response.statusCode = 200;

            Scheduleme.Render.code(req.xhr, res, response);
          }
        });
      }
    })

  } else {
    var response = {
      statusCode: 403
    };
    Scheduleme.Render.code(req.xhr, res, response);
    console.log('Unauthorized access attempt: employee bootstrap');
  }
};
exports.processLogin = function (req, res) {
  console.log('WHAT THE FUCK');
  Scheduleme.Models.Employee.login(req, res);
};
exports.changePassword = function (req, res) {

  if (Scheduleme.Helpers.helpers.validatePassword(req.body.newpassword)) {
    var input = {
      id       : req.session.employee_id,
      oldpassword : Scheduleme.Helpers.helpers.calcHash(req.body.oldpassword),
      newpassword : Scheduleme.Helpers.helpers.calcHash(req.body.newpassword),
    };
    Scheduleme.Models.Employee.changePassword(input, function (err) {
      response = {};
      if (err) {
        response.statusCode = 400;
      } else {
        response.statusCode = 200;
      }
      Scheduleme.Render.code(req.xhr, res, response);
    });
  } else {
    response = {
      statusCode   : 400,
      message   : 'Invalid password'
    }
    Scheduleme.Render.code(req.xhr, res, response);
  }
};

/*exports.loadOne = function(req, res){
  if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
    var response = {};
    console.log('Load EmployeeID: '+req.params.id);
    models.Employee.findOne({ _id: req.params.id, employerid: req.session.employerid }, function (err, docs) {
      if (!err) {
        console.log('returning apis');
        response.data = [];
        docs.forEach(function (x) {
          response.data.push(x);
        });
        response.statusCode = 200;
      } else {
        console.log('Error fetching Project: '+err);
        response.statusCode = 500;
      }
      Scheduleme.Render.code(req.xhr, res, response);
    });
  } else {
    Scheduleme.Render.code401(req, res);
    console.log('Unauthorized access attempt: loadOne employee');
  }
};
//This will load all employees for the given employer
exports.load = function (req, res) {
  if (typeof req.session.employerid != 'undefined') {//If an employer is signed in

    console.log('Load Employees for EmployerID: '+req.session.employerid);
    models.Employee.find({ employerid: req.session.employerid }, function (err, docs) {
      if (!err && docs) {
        var response = {};
        response.data = [];
        docs.forEach(function (x) {
          console.log();
          response.data.push(x);
        });
        res.statusCode = 200;
        res.write(JSON.stringify(response));
      } else {
        console.log('Error fetching Projectss: '+err);
        res.statusCode = 499;
      }
      res.end();
    });
  } else {
    res.statusCode = 403; //Unauthorized access?
    res.end();
    console.log('Unauthorized access attempt: load employees');
  }
};
exports.create = function(req, res){
  if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
    var email = req.body.email;
    var password = calcHash(req.body.password);
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var employer = req.session.employerid; //Current employer
    var positions = req.body.positions;

    //TODO: Validate email (can take function from another project)

    var employee = new Employee ({
      email: email ,
      password: password,
      first_name: first_name,
      last_name: last_name,
      employer: company,
      positions: positions,
      last_login:'',
      login_count:0,
      reg_time:new Date()
    });

    employee.save(function (err) {
      if (!err) {
        console.log('New Employee created');
        res.statusCode = 201;
      } else { //There was an error
        console.log('There was an error creating an employee: '+err);
        res.statusCode = 401;
      }
      res.end('Employee - create');
    });
  } else {
    Scheduleme.Render.code403(req, res);
    console.log('Unauthorized access attempt: create employee');
  }
};
exports.update = function(req, res) {
  console.log('Update Employee ID: '+req.params.id);
  res.send("Employee - update");
};
exports.addPosition = function(req, res) {
  //Add a position to an employee (given by req.params.eid)
  var new_positions = req.body.positions;

  //TODO: Verify that passed positions exist in the employer

  models.Employee.update({ _id:req.params.eid, employer:req.session.employerid },
      {$addToSet: {positions: { $each: new_positions }}}, false, false, function (err) {
        if (!err) {
          res.statusCode = 201;
        } else {
          res.statusCode = 500;
          console.log('there was an error: '+err);
        }
        res.end();
      });
};
exports.changePassword = function(req,res){
  if (typeof req.session.employeeid != 'undefined') {//If an employer is signed in
    //Update Password
    var oldPassword = calcHash(req.body.oldpassword);
    var newPassword = calcHash(req.body.newpassword);

    //TODO: Validate new password
    if (newPassword.length) {
      models.Employee.update( { _id:req.session.employeeid, password:oldPassword }, { password:newpassword }, { multi:false }, function(err, numAffected) {
        if (!err) {
          //Note that I am making the assumption that if there is no error, than a row was updated (not checking numAffected)
          console.log('Employee '+req.session.employeeid+' password updated');
          res.statusCode = 200;
          res.end("Password Updated");
        } else { //An error
          Scheduleme.Render.code500(req, res);
        }
      });
    } else {
      Scheduleme.Render.code400(req, res);
    }
  } else {
    Scheduleme.Render.code403(req, res);
    console.log('Unauthorized access attempt: create employee');
  }
};
exports.deleteEmployee = function(req, res) {
  if (typeof req.session.employerid != 'undefined') {//If an employer is signed in
    //Post all of the employees shifts as up for grabs, and then remove him from the system
    console.log('Delete  ID: '+req.params.id);
    res.send("projects - delete");
  } else {
    Scheduleme.Render.code403(req, res);
    console.log('Unauthorized access attempt: create employee');
  }
};
*/