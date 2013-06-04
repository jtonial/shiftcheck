console.log('Loading me engine...');

var express     = require('express') ,
    Main        = require('../../helpers/global.js') ,
    app         = module.exports = express();


app.locals(Main.Config.views);


app.set('views', __dirname+'/views');


app.get('/bootstrap', function (req, res) {
  if (employee) { //An employee is signed in
    Main.Controllers.Employees.bootstrap(req, res); // TODO: Write this function
  } else if (admin) {
    Main.Controllers.Employers.bootstrap(req, res); //TODO: Write this function
  } else {
    Main.Render.code403(req, res);
  }
});

app.post('/me/changePassword', function (req,res) {
  if (employee) {
    Main.Controllers.Employees.changePassword(req, res);
  } else if (admin) {
    Main.Controllers.Employers.changePassword(req, res);
  } else {
    Main.Render.code403(req, res);
  }
});

app.post('/me/update', function (req, res) {
  if (employee) {
    Main.Controllers.Employees.updateContact(req, res);
  } else if (admin) {
    Main.Controllers.Employers.update(req, res);
  } else {
    Main.Render.code403(req, res);
  }
});