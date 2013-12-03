
require(__basedir+'/connections/logger').info('Loading employee engine...');

var express     = require('express') ,
    Main        = require(__basedir+'/helpers/global.js') ,
    app         = module.exports = express() ,
    Controller  = require('./controller') ,
    Employee    = require('../auth/userModel.js') ;


app.locals(Main.Config.views);


//app.set('views', __dirname+'/views');

// Check that session is employer, or respond with 403
var employerOnly = function (req, res, next) {
  if (req.user.admin) {
    next();
  } else {
    Main.Render.code403(req, res);
  }
};

function permissionCheck (entity) {
  return function (req, res, next) {
    var obj = {
      method   : req.method,
      obj_type : entity,
      obj_id   : req.params[entity+'_id'],
      user_id  : req.user.user_id
    };

    Main.Logger.debug(obj);

    // if (obj.obj_type == '') {
    //   supplierOnly( req, res, next );
    // } else if (obj.obj_type == 'review') {
    //   userOnly( req, res, next );
    // } else if (obj.obj_type == 'product') {
    //   if (obj.method != 'GET') {
    //     supplierOnly( req, res, next );
    //   } else {
    //     next();
    //   }
    // }

    next();

  };
}

var loadEmployee = function (req, res, next, id) {
  var employee = new Employee({ id: id });
  employee.fetch( function () {
    if (employee._notExists) {
      Main.Render.code(req, res, { statusCode : 404 } );
    } else {
      req.employee = employee;
      next();
    }
  });
};

app.use(Main.Helpers.signedInOnly);

app.param('employee_id', function(req, res, next, id){
  loadEmployee(req, res, next, id);
});

app.get('/',        [ permissionCheck('employee') ], Controller.fetch );
app.post('/',       [ permissionCheck('employee') ], Controller.create );
app.delete('/:id',  [ permissionCheck('employee') ], Controller.delete );
