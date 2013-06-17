
console.log('Loading schedule engine...');

var express     = require('express') ,
    Main        = require(__basedir+'/helpers/global.js') ,
    app         = module.exports = express() ,
    Controller  = require('./controller.js') ,
    Schedule    = require('./backbone-model.js') ;


app.locals(Main.Config.views);


app.set('views', __dirname+'/views');


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
var loadSchedule = function (req, res, next) {
  var schedule = new Schedule({ id: req.params.schedule_id });
  schedule.fetch( function (err) { // TODO: do something with err
    if (err) {
      Main.Render.code(req, res, { statusCode : 500, error: err } )
    } else if (schedule._notExists) {
      Main.Render.code(req, res, { statusCode : 404 } )
    } else {
      req.schedule = schedule;
      next();
    }
  })
}

// Uploading Schedules
app.get('/',                Controller.getSchedules );
app.get('/:schedule_id',    [ permissionCheck, loadSchedule ], Controller.getById );
app.get('/date/:date',      [ permissionCheck ], Controller.loadDate );

app.post('/client-upload',  [ permissionCheck ], Controller.clientUpload );
app.post('/upload',         [ permissionCheck ], Controller.upload );
app.post('/uploadshifts',   [ permissionCheck ], Controller.upload );

app.post('/:schedule_id/publish',   [ permissionCheck, loadSchedule ], Controller.publish );
app.post('/:schedule_id/unpublish', [ permissionCheck, loadSchedule ], Controller.unpublish );
app.post('/verifyUpload',           [ permissionCheck ], Controller.verifyUpload );

app.put('/:schedule_id',    [ permissionCheck, loadSchedule ], Controller.update);
