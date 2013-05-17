console.log('Loading position engine...');

var express = require('express');
var app = module.exports = express();

var Main = require('../../helpers/global.js');

app.locals({
  site_name: Main.Config.name,
  site_name_lower: Main.Config.name_lower,

  facebook_url: Main.Config.facebook_url,
  twitter_url: Main.Config.twitter_url
});

//app.set('views', __dirname+'/views');


// Check that session is employer, or respond with 403
var employerOnly = function (req, res, next) {
  if (admin) {
    next();
  } else {
    Main.Helpers.Render.code403(req, res);
  }
}


app.get('/positions', function (req, res) {
  //if (employer) {
    Main.Controllers.Employers.getPositions(req, res);
  //} else {
  //  Main.Helpers.Render.code403(req, res);
  //}
})
app.post('/positions', employerOnly, function (req, res) {
  Main.Controllers.Employers.addPosition(req, res);
})
app.put('/positions/:id', employerOnly, function (req, res) {
  Main.Controllers.Employers.updatePosition(req, res);
})