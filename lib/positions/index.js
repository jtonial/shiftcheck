console.log('Loading position engine...');

var express     = require('express') ,
    Main        = require('../../helpers/global.js') ,
    app         = module.exports = express();


app.locals({
  site_name: Main.Config.name,
  site_name_lower: Main.Config.name_lower,

  title: Main.Config.name,

  facebook_url: Main.Config.facebook_url,
  twitter_url: Main.Config.twitter_url
});

//app.set('views', __dirname+'/views');


// Check that session is employer, or respond with 403
var employerOnly = function (req, res, next) {
  if (admin) {
    next();
  } else {
    Main.Render.code403(req, res);
  }
}


app.get('/', function (req, res) {
  //if (employer) {
    Main.Controllers.Employers.getPositions(req, res);
  //} else {
  //  Main.Render.code403(req, res);
  //}
})
app.post('/', employerOnly, function (req, res) {
  Main.Controllers.Employers.addPosition(req, res);
})
app.put('/:id', employerOnly, function (req, res) {
  Main.Controllers.Employers.updatePosition(req, res);
})