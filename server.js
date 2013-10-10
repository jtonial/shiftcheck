

// Set a global reference to the base directory (mostly used for referencing views/includes)
global.__basedir = __dirname;
console.log('Executing with base dir: '+__basedir);

var cluster     = require('cluster') ,
    Main        = require('./helpers/global.js') ;

if (cluster.isMaster && Main.Config.cluster) {
  // Count the machine's CPUs
  var cpuCount = require('os').cpus().length;

  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i += 1) {
      cluster.fork();
  }
  cluster.on('exit', function (worker) {

    // Replace the dead worker,
    console.log('Worker ' + worker.id + ' died :(');
    cluster.fork();

  });
} else {
  var express       = require('express') ,
    http          = require('http') ,
    https         = require('https') ,
    path          = require('path') ,
    RedisStore    = require('connect-redis')(express) ,
    authenticate  = require('./middleware/authenticate') ,
    device        = require('express-device') ,
    Main          = require('./helpers/global') ,
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
    console.log('Loading new Redis client');
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

    var about      = require('./lib/about') ,
        schedules  = require('./lib/schedules') ,
        employees  = require('./lib/employees') ,
        me         = require('./lib/me') ,
        positions  = require('./lib/positions') ,
        auth       = require('./lib/auth') ,
        available_shifts = require('./lib/available_shifts') ,
        change_requests  = require('./lib/change_requests') ;

    app.use('/',          auth)
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
  app.get('/schedule/*',    Main.Render.index)
  app.get('/employee-list', Main.Render.index)
  app.get('/position-list', Main.Render.index)
  app.get('/request-list',  Main.Render.index)


  app.get('/mobile', function (req, res) {
    res.render('mobile', { });
  });


  app.configure('development', function() {
    app.use(express.errorHandler());
  });

  http.createServer(app).listen(app.get('port'), function () {
    console.log('HTTP server listening on %s', app.get('port'));
  });
}