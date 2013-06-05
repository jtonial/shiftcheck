
console.log('Loading auth engine...');

var express   = require('express') ,
    Main      = require('../../helpers/global.js') ,
    app       = module.exports = express();

app.locals(Main.Config.views);

app.set('views', __dirname+'/views');

app.get('/login', function (req, res) {
  if (!employee && !admin) {
    Main.Render.renderLoginPage(req, res);
  } else {
    res.redirect('/');
  }
});
app.get('/manager-login', function (req, res) {
  if (!employee && !admin) {
    Main.Render.renderAdminloginPage(req, res);
  } else {
    res.redirect('/');
  }
});

app.post('/login', function (req, res) {
  if (!employee && !admin) {
    Main.Controllers.Employees.processLogin(req, res);
  } else {
    if (req.xhr) {
      Main.Render.code(req.xhr, res, { statusCode : 400 });
    } else {
      res.redirect('/');
    }
  }
});
app.post('/manager-login', function (req, res) {
  if (!employee && !admin) {
    Main.Controllers.Employers.processLogin(req, res);
  } else {
    if (req.xhr) {
      Main.Render.code(req.xhr, res, { statusCode : 400 });
    } else {
      res.redirect('/');
    }
  }
});

app.get('/logout', Main.Helpers.logout);

app.get('/signup', function (req, res) {
  if (!employee && !admin) {
    Main.Render.renderSignup(req, res);
  } else {
    res.redirect('/');
  }
});
app.post('/signup', function (req, res) {
  Main.Controllers.Employers.processSignup(req, res);
});