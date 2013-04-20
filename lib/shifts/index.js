console.log('Loading shift engine...');

var express = require('express');
var app = module.exports = express();

var Main = require('../../helpers/global.js');

app.locals({
  site_name: Main.Config.name,
  site_name_lower: Main.Config.name_lower,

  facebook_url: Main.Config.facebook_url,
  twitter_url: Main.Config.twitter_url
});

app.set('views', __dirname+'/views');


app.put('/shift/:id', function (req, res) {
  if (employer) {
    Scheduleme.Controllers.Schedules.updateShift(req, res);
  } else {
    Scheduleme.Helpers.Render.code403(req, res);
  }
})