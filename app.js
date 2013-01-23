Scheduleme = {
	Helpers : {
		Render	: require('./helpers/render'),
		Helpers : require('./helpers/helpers')
	},
	Controllers : {
		Employees : require('./controllers/employees'),
		Employers : require('./controllers/employers'),
		Schedules : require('./controllers/schedules'),
		Grabs : require('./controllers/grabs')
	},
	Models : {
		Employee : require('./models/employee'),
		Employer : require('./models/employer'),
		Schedule : require('./models/schedule')
	}
}

var express = require('express')
	, http = require('http')
	, https = require('https')
	, path = require('path')
	, fs = require('fs')
	, crypto = require('crypto')
	, RedisStore = require('connect-redis')(express)
	, authenticate = require('./middleware/authenticate')
	, mysql = require('mysql')
	;

//Global
config = require('./config/config')

var key = fs.readFileSync(config.ssl_key);
var cert = fs.readFileSync(config.ssl_cert);
var https_options = {
	key: key,
	cert: cert
};

//MySQL
var app = express();
if (process.env.REDISTOGO_URL) {
	var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var redis = require("redis").createClient(rtg.port, rtg.hostname);

	redis.auth(rtg.auth.split(":")[1]); 
} else {
	var redis = require("redis").createClient();
}

if (typeof process.env.PORT == 'undefined') {
	//Create the MySQL connection
	db = mysql.createConnection({
		host     : process.env.CLEARDB_DATABASE_URL || 'localhost',
		user     : process.env.CLEARDB_DATABASE_USER || 'root',
		password : process.env.CLEARDB_DATABASE_PASSWORD || 'password',
		database : process.env.CLEARDB_DATABASE_DB || 'scheduleme'
	});
} else {
	//Heroku specific
	//Create the MySQL connection
	db = mysql.createConnection({
		host     : process.env.CLEARDB_DATABASE_URL,
		user     : process.env.CLEARDB_DATABASE_USER,
		password : process.env.CLEARDB_DATABASE_PASSWORD,
		database : process.env.CLEARDB_DATABASE_DB
	});
}

db.connect(function (err) {
	if (err) {
		console.log('There was an error connecting to db: '+err);
	} else {
		console.log('db connection open:');
	}
});

function handleDisconnect(db) {
	db.on('error', function(err) {
		if (!err.fatal) {
			return;
		}

		if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
			throw err;
		}

		console.log('Re-connecting lost connection: ' + err.stack);

		db = mysql.createConnection(db.config);
		handleDisconnect(db);
		db.connect(function (err) {
			if (err) {
				console.log('There was an error connecting to db: '+err);
			} else {
				console.log('db connection open:');
			}
		});
	});
}
//Add disconnect handlers
handleDisconnect(db);

app.configure(function(){
	app.set('port', process.env.PORT || config.port );
	app.set('ssl_port', process.env.PORT || config.ssl_port );
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	//app.use(express.logger());//'dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session({
		secret:'asdfadsfasdfw4t3t53', 
		maxAge : new Date( Date.now() + 1800000), // 30 minutes
		store: new RedisStore({client: redis})
    }));
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(authenticate());
	app.use(function (req, res, next) {
		console.log('in middleware');

		employee = (typeof req.session.employee_id != 'undefined');
		employer = (typeof req.session.employer_id != 'undefined');

		if (employee) {
			console.log('Employee is signed in');
			//load employee into req.employee
		} else if (employer) {
			console.log('Employer is signed in');
			//load employee into req.employee
		} else {
			console.log('no one signed in');
		}
		next();
	});
	app.use(function (req, res, next) {
		//trackRequest(req);

		next()
	});
	app.use(app.router);
	app.use(function (req, res) {
		Scheduleme.Helpers.Render.code404(req, res);
	});

	/*trackRequest = function (req) {
		var o = {};

		if (employee) {
			o.user_type = 'employee';
			o.id = req.session.employeeid;
		} else if (employer) {
			o.user_type = 'employer';
			o.id = req.session.employerid;
		} else {
			o.user_type = 'undefined';
		}
		o.method = req.method;
		o.url = req.url;
		o.time = Date();
		o.ip = Scheduleme.Helpers.Helpers.getClientIp(req);

		var tracking = new models.Tracking(o);
		tracking.save(function(err, s) {
			if (!err) {
				console.log();
			} else {
				console.log('Error tracking page load...');
			}
		});
	};*/

	app.get('/', Scheduleme.Helpers.Render.index);
	app.get('/login', function (req, res) {
		if (!employee && !employer) {
			Scheduleme.Helpers.Render.renderLoginPage(req, res);
		} else {
			res.redirect('/');
		}
	});
	app.get('/admin-login', function (req, res) {
		if (!employee && !employer) {
			Scheduleme.Helpers.Render.renderAdminloginPage(req, res);
		} else {
			res.redirect('/');
		}
	});

	app.post('/login', function (req, res) {
		if (!employee) {
			Scheduleme.Controllers.Employees.loginProcess(req, res);
		} else {
			res.redirect('/');
		}
	});
	app.post('/admin-login', function (req, res) {
		if (!employer) {
			console.log('Is employer: '+!employer);
			Scheduleme.Controllers.Employers.processLogin(req, res);
		} else {
			res.redirect('/');
		}
	});

	app.get('/logout', Scheduleme.Helpers.Helpers.logout);
	/*
	app.get('/signup', function (req, res) {
		if (!employee && !employer) {
			render.signup(req, res);
		} else {
			res.redirect('/');
		}
	});
	app.post('/me/changePassword', function (req,res) {
		if (employee) {
			Employees.changePassword(req, res);
		} else if (employer) {
			Employers.changePassword(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	});
	app.post('/me/update', function(req, res) {
		if (employee) {
			Employees.updateContact(req, res);
		} else if (employer) {
			Employers.update(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	});
	app.get('/upload', function (req, res) {
		res.render('testupload', { title: 'testupload' });
	});*/
	app.post('/upload', function (req, res) {
		if (employer) {
			Scheduleme.Controllers.Schedules.clientUpload(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	});
	/*app.post('/serverupload', Schedules.upload);

	app.get('/verifyUpload', function (req, res) {
		console.log('GET - verifyUpload');		
		Schedules.verifyUpload(req,res);
	});
	app.post('/verifyUpload', function (req, res) {
		console.log('POST - verifyUpload');
		Schedules.verifyUpload(req,res);
	});
	*/

	//Me
	app.get('/bootstrap', function (req, res) {
		if (employee) { //An employee is signed in
			Scheduleme.Controllers.Employees.bootstrap(req, res); // TODO: Write this function
		} else if (employer) {
			Scheduleme.Controllers.Employers.bootstrap(req, res); //TODO: Write this function
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	});
	
	//app.get('/schedules/:date', Scheduleme.Controllers.Schedules.loadDate);

});

app.configure('development', function() {
  app.use(express.errorHandler());
});

if (false/*typeof process.env.PORT == 'undefined'*/) {
	//Because of this I should not need to check for req.secure anywhere in the app, as everything has to come in on port 443
	http.createServer(function (req, res) {		
		var to = 'https://'+req.headers.host+req.url;
		console.log('Redirecting to '+to);
		res.writeHeader(302, {
			'Location': to
		});
		res.end();
	}).listen(80, function () {
		console.log('HTTP Redirect listening on 80');
	});
	https.createServer(https_options, app).listen(app.get('ssl_port'), function () {
		console.log('HTTPS server listening on %s', app.get('ssl_port'));
	});
} else {
	//Heroku Specific
	http.createServer(app).listen(app.get('port'), function () {
		console.log('HTTP server listening on %s', app.get('port'));
	});
}