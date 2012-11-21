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
		if (employer) {
			schedules.upload(req, res);
		} else {
			res.statusCode = 403;
			res.end();
		}
	});

/*
	//Doesn't work
	app.get('/gets3creds', function (req, res) {
		var createS3Policy;
		var s3Signature;
		var s3Credentials;

		var s3PolicyBase64, _date, _s3Policy;
		_date = new Date();
		s3Policy = {
			"expiration": "" + (_date.getFullYear()) + "-" + (_date.getMonth() + 1) + "-" + (_date.getDate()) + "T" + (_date.getHours() + 1) + ":" + (_date.getMinutes()) + ":" + (_date.getSeconds()) + "Z",
			"conditions": [
				{ "bucket": "bucketName" }, 
				["starts-with", "$Content-Disposition", ""], 
				["starts-with", "$key", "someFilePrefix_"], 
				{ "acl": "public-read" }, 
				{ "success_action_redirect": "http://example.com/uploadsuccess" }, 
				["content-length-range", 0, 2147483648], 
				["eq", "$Content-Type", 'application/pdf']
			]
		};
	  
		s3Credentials = {
			s3PolicyBase64: new Buffer( JSON.stringify( s3Policy ) ).toString( 'base64' ),
			s3Signature: crypto.createHmac( "sha1", "I1wqnnTDmK3KyfevxK7y4DD053gcLgGGh/kPTvBr" ).update( s3Policy ).digest( "base64" ),
			s3Key: "AKIAIKTL23OZ4ILD5TWQ",
			//s3Redirect: "http://example.com/uploadsuccess",
			s3Policy: s3Policy
		}
			
		res.end(JSON.stringify(s3Credentials));
	});
*/

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
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

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
