
console.log('Loading shift engine...');

var express     = require('express') ,
    Main        = require('../../helpers/global.js'),
    app         = module.exports = express() ,
    Controller  = require('./controller.js') ;

app.locals(Main.Config.views);


//app.set('views', __dirname+'/views');

app.post('/', function (req, res) {
  if (admin) {
    Controller.addShift(req, res);
  } else {
    Scheduleme.Render.code403(req, res);
  }
});
app.put('/:id', function (req, res) {
  if (admin) {
    Scheduleme.Controllers.Schedules.updateShift(req, res);
  } else {
    Scheduleme.Render.code403(req, res);
  }
});