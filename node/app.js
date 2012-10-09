
var express = require('express')
	, config = require('./config/config')
  , routes = require('./routes')
  , employees = require('./routes/employees')
  , employers = require('./routes/employers')
  , schedules = require('./routes/schedules')
  , grabs = require('./routes/grabs')
  , http = require('http')
 	, https = require('https')
	, path = require('path')
	, fs = require('fs')
	;


var key = fs.readFileSync(config.ssl_key);
var cert = fs.readFileSync(config.ssl_cert)

var https_options = {
	key: key,
	cert: cert
};

var app = express();
var store = new express.session.MemoryStore;

app.configure(function(){
  app.set('port', process.env.PORT || config.port );
  app.set('ssl_port', process.env.PORT || config.ssl_port );
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session( {secret:'asdfadsfasdfw4t3t53', store:store} ));
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', routes.loginProcess);
app.get('/logout', routes.logout);
app.post('/logout', routes.logout);

app.get('/signup', routes.signup);

//Me

//Employee
app.get('/employees', employees.load);
app.get('/employees/:id', employees.loadOne);
app.post('employees', employees.create);
app.put('/employees', employees.update);
app.delete('/employees/:id', employees.delete);

//Employers
app.get('/employers', employers.loadMe);
app.get('/employers/all', employers.load);
app.post('/employers', employers.create);
app.put('/employers/:id', employers.update);
app.delete('/employers/:id', employers.delete);

//Schedules
app.get('/schedules', schedules.load);
app.get('/schedules/:date', schedules.loadDate);
app.post('/schedules', schedules.create);
app.post('/schedules/upload', schedules.processUpload);

//Grabs and Requests
app.get('/upforgrabs', grabs.load);
app.post('/upforgrabs/:id', grabs.create);
app.post('/upforgrabs/:id/request', grabs.addRequest);

app.get('/requests', grabs.getRequests);
app.post('/requests/:id', grabs.respondRequest);
app.delete('/requests/:id', grabs.deleteRequest);


http.createServer(app).listen(app.get('port'), function(){
  console.log("HTTP server listening on %s", app.get('port'));
});
//https.createServer(https_options, app).listen(app.get('ssl_port'));

//, 'localhost', function() {
//	console.log('HTTPS server listening on %s', app.get('ssl_port'));
//})
