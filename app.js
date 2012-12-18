var express = require('express')
	, config = require('./config/config')
	, routes = require('./routes')
	, render = require('./routes/render')
	, employees = require('./routes/employees')
	, employers = require('./routes/employers')
	, schedules = require('./routes/schedules')
	, grabs = require('./routes/grabs')
	, models = require('./models/models.js')
	, http = require('http')
	, https = require('https')
	, path = require('path')
	, fs = require('fs')
	, crypto = require('crypto')
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
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(app.router);

	var employee;
	var employer;

	getClientIp = function(req) {
		var ipAddress;
		// Amazon EC2 / Heroku workaround to get real client IP
		var forwardedIpsStr = req.header('x-forwarded-for'); 
		if (forwardedIpsStr) {
			// 'x-forwarded-for' header may return multiple IP addresses in
			// the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
			// the first one
			var forwardedIps = forwardedIpsStr.split(',');
			ipAddress = forwardedIps[0];
		}
		if (!ipAddress) {
			// Ensure getting client IP address still works in
			// development environment
			ipAddress = req.connection.remoteAddress;
		}
		return ipAddress;
	};
	trackRequest = function (req) {
		var o = new Object();

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
		o.ip = getClientIp(req);

		var tracking = new models.Tracking(o);
		tracking.save(function(err, s) {
			if (!err) {
				console.log();
			} else {
				console.log('Error tracking page load...');
			}
		})
	};


	app.all('*', function (req, res, next) {
		employee = (typeof req.session.employeeid != 'undefined');
		employer = (typeof req.session.employerid != 'undefined');

		trackRequest(req);

		next();
	});

	app.get('/', render.index);
	app.get('/login', function (req, res) {
		if (!employee && !employer) {
			render.loginPage(req, res);
		} else {
			res.redirect('/');
		}
	});
	app.post('/login', function (req, res) {
		if (!employee) {
			routes.loginProcess(req, res);
		} else {
			res.redirect('/');
		}
	});

	app.get('/logout', routes.logout);
	app.post('/logout', routes.logout);

	app.get('/admin-login', function (req, res) {
		if (!employee && !employer) {
			render.adminloginPage(req, res);
		} else {
			res.redirect('/');
		}
	});
	app.post('/admin-login', function (req, res) {
		if (!employer) {
			routes.adminloginProcess(req, res);
		} else {
			res.redirect('/');
		}
	});

	app.get('/signup', function (req, res) {
		if (!employee && !employer) {
			render.signup(req, res);
		} else {
			res.redirect('/');
		}
	});
	app.get('/upload', function (req, res) {
		res.render('testupload', { title: 'testupload' });
	});
	app.post('/upload', function (req, res) {
		if (employer) {
			schedules.clientUpload(req, res);
		} else {
			render.code403(req, res);
		}
	});
	app.post('/serverupload', schedules.upload);

	app.get('/verifyUpload', function (req, res) {
		console.log('GET - verifyUpload');		
		schedules.verifyUpload(req,res);
	});
	app.post('/verifyUpload', function (req, res) {
		console.log('POST - verifyUpload');
		schedules.verifyUpload(req,res);
	});

	app.get('/testupload', function (req, res) {
		res.render('testupload', { title: 'testupload' });
	});

	//Me
	app.get('/bootstrap', function (req, res) {
		if (employee) { //An employee is signed in
			employees.bootstrap(req, res); // TODO: Write this function
		} else if (employer) {
			employers.bootstrap(req, res); //TODO: Write this function
		} else {
			render.code403(req, res);
		}
	});
	
/* //NOT INCLUDED IN MVP
	Note: I may have to include the schedule paths to work with backbone
	//Employee
	app.get('/employees', employees.load);
	app.get('/employees/:id', employees.loadOne);
	app.post('employees', employees.create);
	app.put('/employees', employees.update);
	app.delete('/employees/:id', employees.delete);

	//Employers
	app.get('/employers', employers.load);
	app.get('/employers/all', employers.loadOne);
	app.post('/employers', employers.create);
	app.put('/employers/:id', employers.update);
	app.delete('/employers/:id', employers.delete);

	app.get('/positions', function (req, res) {
		if (employer) {
			employers.getPositions(req, res);
		}
	});
	app.post('/positions/', function (req, res) {
		if (employer) {
			employers.createPosition (req, res);
		}
	});
	app.post('/positions/:eid', function (req, res) {
		if (employer) {
			employees.addPosition (req, res);
		}
	});

	//Schedules
	app.get('/schedules', schedules.load);
	app.get('/schedules/:date', schedules.loadDate);
	app.post('/schedules', schedules.upload);
	app.post('/schedules/upload', schedules.processUpload);

	//Grabs and Requests
	app.get('/exchanges', grabs.load);
	app.post('/exchanges/:id', grabs.create);
	app.post('/exchanges/:id/request', grabs.addRequest);

	app.get('/requests', grabs.getRequests);
	app.post('/requests/:id', grabs.respondRequest);
	app.delete('/requests/:id', grabs.deleteRequest);
	*/

	app.all('*', function (req, res) {
		render.code404(req, res);
	});

});

app.configure('development', function() {
  app.use(express.errorHandler());
});

if (typeof process.env.PORT == 'undefined') {
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
	})
} else {
	//Heroku Specific
	http.createServer(app).listen(app.get('port'), function () {
		console.log('HTTP server listening on %s', app.get('port'));
	})
}