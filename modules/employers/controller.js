var Main      = require(__basePath+'/main.js') ,
    _         = require('underscore') ;

exports.bootstrap = function(req, res){
  if (req.user.admin) {//If an employer is signed in

    var response = {};
    response.data = {};

    var employer = new Main.Models.Employer({ id : req.user.employer_id });
    employer.fetch( function (err, result) {

      if (err) {
        var obj = {
          statusCode : 500,
          message : err.code
        }
        Main.Render.code(req, res, obj);
      } else if ( employer._notExists ) {
        var obj = {
          statusCode : 404,
          message : 'The employer does not seem to exist, or could not be found'
        }
        Main.Render.code(req, res, obj);
      } else {

        _.extend(response.data, employer.toJSON());

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
