// Note: I should generate all the errors I will return, and make a code mapping for all of them

var Main      = require(__basedir+'/helpers') ,
    User      = require('./userModel.js') ,
    db        = Main.mysql , //Main.mysql ,
    Queries   = require('./helpers/queries.js') ,
    Errors    = require('./helpers/errors') ,
    Employer  = require('../employers/model') ;

// This does nothing right now; its something im still working on and more info will be in the model
var schema = User.schema;

exports.renderRegisterPage = function (req, res) {
  res.render('register', { user: req.user } );
};

// This should be done as a transaction
exports.createEmployer = function (req, res) {

  var employer = new Employer({
    name : req.body.employer.name,
    contact_email: req.body.user.email,
    contact_phone: req.body.employer.phone
  });

  var user = new User();
  user.set({
    first_name    : req.body.user.first_name,
    last_name     : req.body.user.last_name,
    email         : req.body.user.email,
    username      : req.body.user.email,
    password      : Main.Helpers.hash.calc(req.body.user.password)
  });

  var employerValidation = employer.validate();
  var userValidation = user.validate();

  if (employer.isValid(true) && user.isValid(true)) { // These must pass true if model hasn't been validated yet
    // Create the employer
    employer.save( function (err, result) {
      if (err) {
        Main.Logger.error(err);
        var response = {
          statusCode : 500,
          error : 'Error saving employer'
        };

        Main.Render.code(req, res, response);
      } else {
        console.log('employer saved: '+employer.id);
        // Create the user account for the employer
        user.set('employer_id', employer.id);
        user.save( function (err, result) {

          if (err) {
            Main.Logger.error(err);
            var response = {
              statusCode : 500,
              error : 'Error saving User'
            };

            Main.Render.code(req, res, response);
          } else {
            user.makeAdmin( function (err, result) {

              if (err) {
                Main.Logger.error(err);
                var response = {
                  statusCode : 500,
                  error : 'Error making User Admin'
                };

                Main.Render.code(req, res, response);
              } else {
                req.session.user_id     = user.id;
                req.session.email       = user.get('email');
                req.session.first_name  = user.get('first_name');
                req.session.last_name   = user.get('last_name');
                req.session.employer_id = user.get('employer_id');
                req.session.admin       = user.get('admin');

                Main.Render.code(req, res, { statusCode : 200 });

                // Send Registration Email
                // Main.Workers.push('shiftcheck_email', {
                //   action : 'email',
                //   object : 'employer',
                //   id     : employer.id,
                //   action_to_report : 'signup'
                // });
              }
            });
          }
        });
      }
    });
  } else {
    var response = {
      statusCode : 400
    }
;
    Main.Render.code(req, res, response);
  }
};

exports.addUser = function (req, res) {

  var errors = [];

  var obj = req.body;

  // This should be moved into the model
  if (!(typeof req.body.user.email != 'undefined' && Main.Helpers.validateEmail(req.body.user.email))) {
    errors.push(Errors.invalidEmail);
  }
  if (typeof req.body.user.first_name == 'undefined') {
    errors.push(Errors.invalidFirstName);
  }
  if (typeof req.body.user.last_name == 'undefined') {
    errors.push(Errors.invalidLastName);
  }

  if (errors.length) {
    //Errors, send error response
    var response = {
      statusCode : 400,
      errors     : errors
    };

    Main.Render.code(req, res, response);
    return 0;
  }

  var user = new User();
  user.set({
    first_name    : req.body.user.first_name,
    last_name     : req.body.user.last_name,
    Username      : req.body.user.username,
    email         : req.body.user.email,
    password      : Main.Helpers.hash.calc(req.body.user.password)
  });

  user.save(function saveCallback (err, response) {
    var response = {};
    if (err) {
      response.statusCode    = 500;
      response.message       = err;
    } else {
      response.statusCode     = 200;
      response.id             = user.id;

      // Send Registration Email
      // Main.Workers.push('shiftcheck_email', {
      //   action : 'email',
      //   object : 'user',
      //   id     : user.id,
      //   action_to_report : 'signup'
      // });
    }
    
    Main.Render.code(req, res, response);

  });

};

exports.update = function(req, res) {

  var password  = req.body.password;
  var user      = req.userModel;

  // Require password to change account
  //if (Main.Helpers.hash.compare(password, user.get('password')) {
    // Save body
    for (key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        user.set(key, req.body[key]);
      }
    }
    user.save(function (err, result) {
      var response = {};

      if (err) {
        if (user._invalid) {
          response.statusCode = 400;
        } else {
          response.statusCode = 500;
        }
        response.error        = err;
      } else {
        response.statusCode   = 200;
        response.data         = user.toPublicJSON();
        // Or this could be _.extend(response, product.toPublicJSON());          
      }

      Main.Render.code(req, res, response );
    });
  //} else {
  //  Main.Render.code(req, res, { statusCode: 400, error: 'Incorrect password' })
  //}

};

exports.changePassword = function (req, res) {
  var old_password = req.body.password.current;
  var new_password = req.body.password.new;

  var user = new User({
    id: req.session.user_id
  });

  user.fetch( function (err) {
    if (Main.Helpers.hash.compare(old_password, user.get('password'))) {
      if (Main.Helpers.validatePassword(new_password)) {

        user.set('password', Main.Helpers.hash.calc(new_password));

        user.savePassword( function (err, result) {
          if (err) {
            var response = {
              statusCode : 500,
              errors : err
            };
          } else {
            var response = {
              statusCode : 200
            };

            Main.Workers.push('email', {
              action : 'email',
              object : 'user',
              id     : user.id,
              action_to_report : 'passwordChange'
            });
          }
          Main.Render.code(req, res, response );
        });
      } else {
        Main.Render.code(req, res, { statusCode : 400, error : ['The new password is invalid'] } );
      }
    } else {
      Main.Render.code(req, res, { statusCode : 400, error : ['The password entered is incorrect'] } );
    }
  });

};

exports.login = function (req, res) {
  var email = req.body.email;
  if (typeof email != 'undefined' && email !== '' && typeof req.body.password != 'undefined') {
    var password = req.body.password;

    var response = {};
    db.query(Queries.selectForLogin, [email], function (err, row) {
      if (err) {
        //Handle error, and 'end' event will be emitted after this.
        response.statusCode = 500;
        response.message = err.code;
        Main.Logger.error(err.code);
      } else {
        if (row[0]) {
          console.log(password);
          console.log(row[0].password);
          if (Main.Helpers.hash.compare(password, row[0].password)) {
            req.session.user_id     = row[0].user_id;
            req.session.email       = email;
            req.session.first_name  = row[0].first_name;
            req.session.last_name   = row[0].last_name;
            req.session.employer_id = row[0].employer_id;
            req.session.admin       = row[0].admin;

            response.statusCode = 200;

            db.query(Queries.updateLogin, [req.session.user_id], function (err, numAffected) {
              if (err) {
                Main.Logger.error('ERROR:: Updating user login: '+err);
              }
            });

          } else {
            //Incorrect password
            //Update last login attempt, etc.
            Main.Logger.info('Failed login attempt for user '+row[0].user_id);
            response.statusCode = 400;
            response.message ='Username or password is incorrect';
          }
        } else {
          response.statusCode = 400;
          response.message ='Username or password is incorrect';
        }
      }
      Main.Render.code(req, res, response);
    });
  } else {
    var response = {
      statusCode  : 400,
      message     : 'Email or password is missing or empty'
    };
    
    Main.Render.code(req, res, response);
  }
};

exports.logout = function (req, res) {
  req.session.destroy();
  if (req.headers['accept'] == 'application/json') {
    res.end();
  } else {
    res.redirect('/');
  }
};
