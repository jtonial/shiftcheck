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

	app.all('*', function (req, res, next) {
		employee = (typeof req.session.employeeid != 'undefined');
		employer = (typeof req.session.employerid != 'undefined');

		next();
	})
	app.get('/', routes.index);
	app.get('/login', function (req, res) {
		if (!employee && !employer) {
			routes.loginPage(req, res);
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
			routes.adminloginPage(req, res);
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
			routes.signup(req, res);
		} else {
			res.redirect('/');
		}
	});

	app.post('/upload', function (req, res) {
		//if (employer) {
			schedules.clientUpload(req, res);
		//} else {
		//	res.statusCode = 403;
		//	res.end();
		//}
	});
	app.post('/verifyUpload', schedules.verifyUpload);

	//I can upload, however permissions are not right
	app.get('/gets3creds', function (req, res) {
		//Check permission; only employers should be able to upload
			//Note I am skipping this for now for testing
			//This should also insert the schedule into the database, with a field stating that the upload has not yet completed. This field will be removed on successful upload
	});

	app.get('/testupload', function (req, res) {
		res.render('testupload', { title: 'testupload' });
	});
	app.get('/uploadsuccess', function (req, res) {
		//This is what should get pinged on successful upload. This will remove the 'incomplete' flag on the item specified in a parameter
		console.log('GET - uploadsuccess');
		res.end('GET - uploadsuccess');
	});
	app.post('/uploadsuccess', function (req, res) {
		console.log('POST - uploadsuccess');
		res.end('POST - uploadsuccess');
	});

	//Me
	app.get('/me', function (req, res) {
		if (employee) { //An employee is signed in
			employees.loadMe(req, res); // TODO: Write this function
		} else if (employer) {
			employers.loadMe(req, res); //TODO: Write this function
		} else {
			res.statusCode = 403;
			res.end();
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
		res.statusCode = 404;
		res.end();
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