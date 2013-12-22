
var Main          = require('./main.js') ;
    express       = require('express') ,
    http          = require('http') ,
    https         = require('https') ,
    path          = require('path') ,
    RedisStore    = require('connect-redis')(express) ,
    device        = require('express-device') ,
    Main          = require('./main.js') ,
    // redis         = Main.redis ,
    db            = Main.db ,
    app           = express() ;

// I think it's a race condition which is preventing me from using Main.Redis
if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);
  console.log('Loading existing Redis client');
} else {
  var redis = require("redis").createClient();
  Main.Logger.info('Loading new Redis client...');
}

app.configure(function(){
  app.set('port', process.env.PORT || Main.Config.port );
  app.set('ssl_port', process.env.PORT || Main.Config.ssl_port );
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  app.locals(Main.Config.views);


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
    // Load req.session to req.user. This is done incase of any OAuth being added later;
      // I can still base on req.user
    //if (typeof req.session.user_id != 'undefined') {
      req.user = req.session;
    //}

    next();
  });

  var about      = require('./modules/about').server ,
      schedules  = require('./modules/schedules').server ,
      employees  = require('./modules/employees').server ,
      me         = require('./modules/me').server ,
      positions  = require('./modules/positions').server ,
      auth       = require('./modules/auth').server ,
      available_shifts = require('./modules/available_shifts').server ,
      change_requests  = require('./modules/change_requests').server ;

  app.use('/',          auth);
  app.use('/',          me);
  app.use('/about',     about);
  app.use('/schedules', schedules);
  app.use('/positions', positions);
  app.use('/employees', employees);
  app.use('/available_shifts',  available_shifts);
  app.use('/requests',  change_requests);

  //app.use(express.csrf()); //Generate Cross Site Request Forgery keys
  app.use(app.router);

  app.use(function (req, res) {
    Main.Render.code404(req, res);
  });

});


app.get('/',              Main.Render.index);
// In order to accomodate push-state
app.get('/schedule/*',    Main.Render.index);
app.get('/employee-list', Main.Render.index);
app.get('/position-list', Main.Render.index);
app.get('/request-list',  Main.Render.index);


app.get('/mobile', function (req, res) {
  res.render('mobile', { });
});


app.configure('development', function() {
  app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'), function () {
  Main.Logger.info('HTTP server listening on %s', app.get('port'));
});
