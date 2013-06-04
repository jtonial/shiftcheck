
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
app.post('/client-upload', employerOnly, function (req, res) {
  Main.Controllers.Schedules.clientUpload(req, res);
});
app.post('/upload', employerOnly, function (req, res) {
  Main.Controllers.Schedules.upload(req, res);
});

app.post('/uploadshifts', employerOnly, function (req, res) {
  Main.Controllers.Schedules.upload(req, res);
})

app.get('/date/:date', Main.Controllers.Schedules.loadDate);

app.get('/:schedule_id', Controller.getById)

app.post('/:schedule_id/publish', employerOnly, function (req, res) {
  Main.Controllers.Schedules.publish(req, res);
})
app.post('/:schedule_id/unpublish', employerOnly, function (req, res) {
  Main.Controllers.Schedules.unpublish(req, res);
})
app.post('/verifyUpload', employerOnly, function (req, res) {
  Main.Controllers.Schedules.verifyUpload(req,res);
});

