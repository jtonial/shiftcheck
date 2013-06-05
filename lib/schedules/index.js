
console.log('Loading schedule engine...');

var express     = require('express') ,
    Main        = require('../../helpers/global.js') ,
    Controller  = require('./controller.js') ,
    app         = module.exports = express() ;

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

// Uploading Schedules
app.post('/client-upload',  employerOnly, Controller.clientUpload );

app.post('/upload',         employerOnly, Controller.upload );

app.post('/uploadshifts',   employerOnly, Controller.upload );

app.get('/date/:date',      employerOnly, Controller.loadDate );

app.get('/:schedule_id',    employerOnly, Controller.getById );

app.post('/:schedule_id/publish',   employerOnly, Controller.publish );
app.post('/:schedule_id/unpublish', employerOnly, Controller.unpublish );
app.post('/verifyUpload',           employerOnly, Controller.verifyUpload );
