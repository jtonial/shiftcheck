/*
  WTF is wrong with me. Employer should not be an account, it should just be an entry.
  Admins should just be users with an admin table row
  This allows for a user to be admin of multiple employers, and an employer to have multiple admins
*/


var express       = require('express')
  , http          = require('http')
  , https         = require('https')
  , path          = require('path')
  , fs            = require('fs')
  , crypto        = require('crypto')
  , RedisStore    = require('connect-redis')(express)
  , authenticate  = require('./middleware/authenticate')
  , device        = require('express-device')
  , Main          = require('./helpers/global')
  , db            = Main.db
  , app           = express()
  ;

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]); 
  console.log('Loading existing Redis client');
} else {
  var redis = require("redis").createClient();
  console.log('Loading new Redis client');
}

app.configure(function(){
  app.set('port', process.env.PORT || Main.Config.port );
  app.set('ssl_port', process.env.PORT || Main.Config.ssl_port );
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.locals({
    site_name: Main.Config.name,
    site_name_lower: Main.Config.name_lower,

    title: Main.Config.name,

    facebook_url: Main.Config.facebook_url,
    twitter_url: Main.Config.twitter_url
  });
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({
    secret   : Main.Config.session_secret, 
    maxAge   : new Date( Date.now() + 1800000), // 30 minutes
    store    : new RedisStore({client: redis})
  }));
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));

  // app.use(Main.Permissions.load);

  app.use(device.capture());

  app.use(function (req, res, next) {
    //Initialize shortcuts for checking employee/employer
    employee  = (typeof req.session.employee_id != 'undefined');
    admin     = (typeof req.session.employer_id != 'undefined');

    next();
  });

  var about      = require('./lib/about');
  var schedules  = require('./lib/schedules');
  var employees  = require('./lib/employees');
  var me         = require('./lib/me');
  var positions  = require('./lib/positions');
  var shifts     = require('./lib/shifts');

  app.use('/about', about);
  app.use('/schedules', schedules);
  app.use('/', me);
  app.use('/positions', positions);
  app.use('/employees', employees);
  app.use('/shifts', shifts);

  app.use(function (req, res, next) {

    Main.Tracking.trackRequest(req);

    next();
  });
  //app.use(express.csrf()); //Generate Cross Site Request Forgery keys
  app.use(app.router);
  app.use(function (req, res) {
    Main.Render.code404(req, res);
  });

});


app.get('/', Main.Render.index);
// In order to accomodate push-state
app.get('/schedule/*', Main.Render.index)
app.get('/employee-list', Main.Render.index)
app.get('/position-list', Main.Render.index)
app.get('/request-list', Main.Render.index)


app.get('/mobile', function (req, res) {
  res.render('jquerymobile', { });
});


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


app.get('/testPaste', function (req, res) {
  res.render('testPaste', { title: Main.Config.name });
})


//app.configure('development', function() {
  app.use(express.errorHandler());
//});

http.createServer(app).listen(app.get('port'), function () {
  console.log('HTTP server listening on %s', app.get('port'));
});