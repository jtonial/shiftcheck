
require(__basePath+'/connections/logger').info('Loading change request engine...');

var express     = require('express') ,
    Main        = require(__basePath+'/main.js') ,
    app         = module.exports = express() ,
    Controller  = require('./controller.js') ,
    Request     = require('./model.js') ;

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

var loadRequest = function (req, res, next, id) {
  var request = new Request({ id: id });
  request.fetch( function () {
    if (request._notExists) {
      Main.Render.code(req, res, { statusCode : 404 } );
    } else {
      req.request = request;
      next();
    }
  });
};

app.use(Main.Helpers.signedInOnly);

app.param('request_id', function(req, res, next, id){
  loadRequest(req, res, next, id);
});

app.get('/',                  [ permissionCheck('request') ], Controller.fetch );
app.post('/',                 [ permissionCheck('request') ], Controller.create );
app.put('/:request_id',       [ permissionCheck('request') ], Controller.update );
app.delete('/:request_id',    [ permissionCheck('request') ], Controller.delete );