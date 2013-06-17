
console.log('Loading position engine...');

var express     = require('express') ,
    Main        = require(__basedir+'/helpers/global.js') ,
    app         = module.exports = express() ,
    Controller  = require('./controller.js') ,
    Position    = require('./model.js') ;

app.locals(Main.Config.views);


// Check that session is employer, or respond with 403
  // Note that the query itself checks that the position belongs to the current employer
  // This will eventually be changed to a 'hasPermission' check, allowing for (possibly) multiple people have to permission
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
var loadPosition = function (req, res, next) {
  var position = new Position({ id: req.params.id });
  position.fetch( function () {
    if (position._notExists) {
      Main.Render.code(req, res, { statusCode : 404 } )
    } else {
      req.position = position;
      next();
    }
  })
}

app.get('/',        Controller.getPositions )
app.post('/',       [ permissionCheck ], Controller.addPosition )
app.put('/:id',     [ permissionCheck, loadPosition ], Controller.updatePosition )
app.delete('/:id',  [ permissionCheck, loadPosition ], Controller.deactivatePosition )