require(__basePath+'/connections/logger').info('Loading login engine...');

var express     = require('express') ,
    app         = module.exports = express() ,
    Main        = require(__basePath+'/main.js') ,
    User        = require('./userModel.js') ,
    Controller  = require('./controller.js') ;

app.set('views', __dirname+'/views');

app.locals(Main.Config.views);


var onlyIfNotSignedIn = function onlyIfNotSignedIn (req, res, next) {
    if (!req.user.user_id) {
        next();
    } else {
        Main.Render.indexOr(req, res, { statusCode : 403 } );
    }
};
var onlyIfSignedIn = function onlyIfSignedIn (req, res, next) {
    if (req.user.user_id) {
        next();
    } else {
        Main.Render.indexOr(req, res, { statusCode : 403 } );
    }
};

var loadUser = function (req, res, next, id) {
  var user = new User({ id: req.user.id });
  user.fetch( function (err) {
    if (err) {
      Main.Render.code(req, res, { statusCode : 500 } );
    } else if (user._notExists ) {
      Main.Render.code(req, res, { statusCode : 404 } );
    } else {
      req.userModel = user;
      next();
    }
  });
};

app.get('/register',        [ onlyIfNotSignedIn ],  Controller.renderRegisterPage );
app.post('/register',       [ onlyIfNotSignedIn ],  Controller.createEmployer );

// Removed due to the use of a login modal. Left in for future use (maybe)

app.post('/login',          [ onlyIfNotSignedIn ],  Controller.login );

app.put('/change-password', [ onlyIfSignedIn, loadUser ],     Controller.changePassword );
app.put('/update-user',     [ onlyIfSignedIn, loadUser ],     Controller.update );

app.get('/logout',          Controller.logout );
app.post('/logout',         Controller.logout );
