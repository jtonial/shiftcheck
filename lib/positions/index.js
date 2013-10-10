
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

function permissionCheck (entity) {
  return function (req, res, next) {
    var obj = {
      method   : req.method,
      obj_type : entity,
      obj_id   : req.params[entity+'_id'],
      user_id  : req.user.user_id
    }

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

  }
}

var loadPosition = function (req, res, next, id) {
  var position = new Position({ id: id });
  position.fetch( function () {
    if (position._notExists) {
      Main.Render.code(req, res, { statusCode : 404 } )
    } else {
      req.position = position;
      next();
    }
  })
}

app.param('position_id', function(req, res, next, id){
  loadPosition(req, res, next, id);
});

app.get('/',                  [ permissionCheck('position') ], Controller.getPositions )
app.post('/',                 [ permissionCheck('position') ], Controller.addPosition )
app.put('/:position_id',      [ permissionCheck('position') ], Controller.updatePosition )
app.delete('/:position_id',   [ permissionCheck('position') ], Controller.deactivatePosition )