console.log('Loading shift engine...');

var express     = require('express') ,
    Main        = require('../../helpers/global.js'),
    app         = module.exports = express() ,
    Controller  = require('./controller.js') ;

app.locals({
  site_name: Main.Config.name,
  site_name_lower: Main.Config.name_lower,

  title: Main.Config.name,

  facebook_url: Main.Config.facebook_url,
  twitter_url: Main.Config.twitter_url
});

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