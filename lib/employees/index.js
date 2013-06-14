
console.log('Loading employee engine...');

var express     = require('express') ,
    Main        = require('../../helpers/global.js') ,
    app         = module.exports = express() ,
    Controller  = require('./controller') ,
    Employee    = require('./backbone-model.js') ;


app.locals(Main.Config.views);


//app.set('views', __dirname+'/views');

// Check that session is employer, or respond with 403
var employerOnly = function (req, res, next) {
  if (admin) {
    next();
  } else {
    Main.Render.code403(req, res);
  }
}
var permissionCheck = function (req, res, next) {
  /*
  var obj = {
    method  : req.method,
    id      : req.params.id,
    user_id : req.session.user_id
  }

  console.log(obj);
  */
  employerOnly( req, res, next );
  /*
  Main.permissionCheck(obj, function (bool) {
    if (bool) {
      next();
    } else {
      Main.Render.code(req, res, { statusCode: 403, error: 'Permission denied' });
    }
  });
  */
}
var loadEmployee = function (req, res, next) {
  var employee = new Employee({ id: req.params.id });
  employee.fetch( function () {
    if (employee._notExists) {
      Main.Render.code(req, res, { statusCode : 404 } )
    } else {
      req.employee = employee;
      next();
    }
  })
}

//app.use( employerOnly );


app.get('/',        [ permissionCheck ], Controller.getEmployees );
app.post('/',       [ permissionCheck ], Controller.addEmployee );
app.delete('/:id',  [ permissionCheck, loadEmployee ], Controller.deleteEmployee );
