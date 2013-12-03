
require(__basedir+'/connections/logger').info('Loading me engine...');

var express     = require('express') ,
    Main        = require(__basedir+'/helpers/global.js') ,
    app         = module.exports = express();


app.locals(Main.Config.views);


app.set('views', __dirname+'/views');


app.get('/bootstrap', function (req, res) {
  if (req.user.user_id) {
    res.json({ data: {}});
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