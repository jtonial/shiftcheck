
console.log('Loading availabe shift engine...');

var express     = require('express') ,
    Main        = require(__basedir+'/helpers/global.js') ,
    app         = module.exports = express() ,
    Controller  = require('./controller.js') ,
    AvailableShift = require('./model.js') ;

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

var loadAvailableShift = function (req, res, next, id) {
  var available_shift = new AvailableShift({ id: id });
  available_shift.fetch( function () {
    if (available_shift._notExists) {
      Main.Render.code(req, res, { statusCode : 404 } )
    } else {
      req.available_shift = request;
      next();
    }
  })
}

app.param('available_shift_id', function(req, res, next, id){
  loadAvailableShift(req, res, next, id);
});

app.get('/',                          [ permissionCheck('available_shift') ], Controller.fetch )
app.post('/',                         [ permissionCheck('available_shift') ], Controller.create )
app.put('/:ravailable_shiftid',       [ permissionCheck('available_shift') ], Controller.update )
app.delete('/:available_shift_id',    [ permissionCheck('available_shift') ], Controller.delete )