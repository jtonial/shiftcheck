
console.log('Loading shift engine...');

var express     = require('express') ,
    Main        = require(__basedir+'/helpers/global.js'),
    app         = module.exports = express() ,
    Controller  = require('./controller.js') ,
    Shift       = require('./model.js') ;

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
var loadShift = function (req, res, next) {
  var shift = new Shift({ id: req.params.id });
  shift.fetch( function () {
    if (shift._notExists) {
      Main.Render.code(req, res, { statusCode : 404 } )
    } else {
      req.shift = shift;
      next();
    }
  })
}

app.post('/',       [ permissionCheck ], Controller.addShift );
app.put('/:id',     [ permissionCheck, loadShift ], Controller.updateShift );

app.delete('/:id',  [ permissionCheck, loadShift ], Controller.deleteShift );
