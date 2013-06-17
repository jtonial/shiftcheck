
console.log('Loading auth engine...');

var express   = require('express') ,
    Main      = require(__basedir+'/helpers/global.js') ,
    app       = module.exports = express();

app.locals(Main.Config.views);

app.set('views', __dirname+'/views');

var onlySignedOut = function (req, res, next) {
  if (!employee && !admin) {
    next();
  } else {
    res.redirect('/');
  }
}

app.get('/login',          [ onlySignedOut ], Main.Render.renderLoginPage );
app.get('/manager-login',  [ onlySignedOut ], Main.Render.renderAdminloginPage );

app.post('/login',         function (req, res) {
  if (!employee && !admin) {
    Main.Controllers.Employees.processLogin(req, res);
  } else {
    if (req.xhr) {
      Main.Render.code(req, res, { statusCode : 400 });
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
      Main.Render.code(req, res, { statusCode : 400 });
    } else {
      res.redirect('/');
    }
  }
});

app.get('/logout', Main.Helpers.logout);

app.get('/signup',         [ onlySignedOut ], Main.Render.renderSignup );
app.post('/signup', Main.Controllers.Employers.processSignup );