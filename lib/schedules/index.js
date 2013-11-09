
require(__basedir+'/helpers/logger').info('Loading schedule engine...');

var express     = require('express') ,
    Main        = require(__basedir+'/helpers/global.js') ,
    app         = module.exports = express() ,
    Controller  = require('./controller.js') ,
    ShiftController = require('./lib/shifts/controller.js') ,
    Schedule    = require('./model.js') ;
    Shift       = require('./lib/shifts/model.js') ;


app.locals(Main.Config.views);


app.set('views', __dirname+'/views');


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

var loadSchedule = function (req, res, next, id) {
  var schedule = new Schedule({ id: id });
  schedule.fetch( function (err) { // TODO: do something with err
    if (err) {
      Main.Render.code(req, res, { statusCode : 500, error: err } );
    } else if (schedule._notExists) {
      Main.Render.code(req, res, { statusCode : 404 } );
    } else {
      req.schedule = schedule;
      next();
    }
  });
};

var loadShift = function (req, res, next, id) {
  var shift = new Shift({ id: id });
  shift.fetch( function (err) { // TODO: do something with err
    if (err) {
      Main.Render.code(req, res, { statusCode : 500, error: err } );
    } else if (shift._notExists) {
      Main.Render.code(req, res, { statusCode : 404 } );
    } else {
      req.shift = shift;
      next();
    }
  });
};

app.use(Main.Helpers.signedInOnly);

app.param('schedule_id', function(req, res, next, id){
  loadSchedule(req, res, next, id);
});
app.param('shift_id', function(req, res, next, id){
  loadShift(req, res, next, id);
});

// Uploading Schedules
app.get('/',                        [ permissionCheck('schedule') ], Controller.index );
app.get('/:schedule_id',            [ permissionCheck('schedule') ], Controller.show );
app.get('/date/:date',              [ permissionCheck('schedule') ], Controller.loadDate );

app.post('/',                       [ permissionCheck('schedule') ], Controller.create );

app.post('/:schedule_id/publish',   [ permissionCheck('schedule') ], Controller.publish );
app.post('/:schedule_id/unpublish', [ permissionCheck('schedule') ], Controller.unpublish );

app.put('/:schedule_id',            [ permissionCheck('schedule') ], Controller.update);
app.delete('/:schedule_id',         [ permissionCheck('schedule') ], Controller.destroy);

// Shift endpoints

app.post('/:schedule_id/shifts',                [ permissionCheck('shift') ], ShiftController.create );
app.put('/:schedule_id/shifts/:shift_id',       [ permissionCheck('shift') ], ShiftController.update );
app.delete('/:schedule_id/shifts/:shift_id',    [ permissionCheck('shift') ], ShiftController.delete );

