var express = require('express')
	, http = require('http')
	, https = require('https')
	, path = require('path')
	, fs = require('fs')
	, crypto = require('crypto')
	, RedisStore = require('connect-redis')(express)
	, authenticate = require('./middleware/authenticate')
	;

var Scheduleme = require('./helpers/global');
var db = Scheduleme.db;
//console.log(Scheduleme);

//MySQL
var app = express();
if (process.env.REDISTOGO_URL) {
	var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var redis = require("redis").createClient(rtg.port, rtg.hostname);

	redis.auth(rtg.auth.split(":")[1]); 
	console.log('Connecting to existing Redis client');
} else {
	var redis = require("redis").createClient();
	console.log('Creating new Redis client');
}

app.configure(function(){
	app.set('port', process.env.PORT || Scheduleme.Config.port );
	app.set('ssl_port', process.env.PORT || Scheduleme.Config.ssl_port );
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.locals({
		site_name: Scheduleme.Config.name,
		site_name_lower: Scheduleme.Config.name_lower
	});
	app.use(express.favicon());
	//app.use(express.logger());//'dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session({
		secret 	:'asdfadsfasdfw4t3t53', 
		maxAge 	: new Date( Date.now() + 1800000), // 30 minutes
		store 	: new RedisStore({client: redis})
    }));
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(authenticate());
	app.use(function (req, res, next) {
		//Initialize shortcuts for checking employee/employer
		employee = (typeof req.session.employee_id != 'undefined');
		employer = (typeof req.session.employer_id != 'undefined');

		next();
	});
	/*app.use(function (req, res, next) { //If static resources are put to S3 then their events wont appear here

		var response = require( "express" ).response;

		var _end = response.end;
		response.end = function( ) {
			// Scheduleme.Logger.info('End event intercepted');
			_end.apply( this, arguments );
		};

		next();
	});*/
	app.use(function (req, res, next) {

		Scheduleme.Tracking.trackRequest(req);

		next();
	});
	//app.use(express.csrf()); //Generate Cross Site Request Forgery keys
	app.use(app.router);
	app.use(function (req, res) {
		Scheduleme.Helpers.Render.code404(req, res);
	});

	app.get('/jquerymobile', function (req, res) {
		res.render('mobile2', { });
	});
	app.get('/', Scheduleme.Helpers.Render.index);
	app.get('/newdash', function (req, res) {
		res.render('newdash', { title: 'Schedule.me' })
	})
	app.get('/schedule/*', Scheduleme.Helpers.Render.index)
	app.get('/login', function (req, res) {
		if (!employee && !employer) {
			Scheduleme.Helpers.Render.renderLoginPage(req, res);
		} else {
			res.redirect('/');
		}
	});
	app.get('/manager-login', function (req, res) {
		if (!employee && !employer) {
			Scheduleme.Helpers.Render.renderAdminloginPage(req, res);
		} else {
			res.redirect('/');
		}
	});

	app.post('/login', function (req, res) {
		if (!employee && !employer) {
			Scheduleme.Controllers.Employees.processLogin(req, res);
		} else {
			res.redirect('/');
		}
	});
	app.post('/manager-login', function (req, res) {
		if (!employee && !employer) {
			console.log('Is employer: '+!employer);
			Scheduleme.Controllers.Employers.processLogin(req, res);
		} else {
			res.redirect('/');
		}
	});

	app.get('/logout', Scheduleme.Helpers.Helpers.logout);

	app.get('/signup', function (req, res) {
		if (!employee && !employer) {
			Scheduleme.Helpers.Render.renderSignup(req, res);
		} else {
			res.redirect('/');
		}
	});
	app.post('/signup', function (req, res) {
		Scheduleme.Controllers.Employers.processSignup(req, res);
	});

	// Change stuff about curent account
	app.post('/me/changePassword', function (req,res) {
		if (employee) {
			Scheduleme.Controllers.Employees.changePassword(req, res);
		} else if (employer) {
			Scheduleme.Controllers.Employers.changePassword(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	});
	app.post('/me/update', function (req, res) {
		if (employee) {
			Scheduleme.Controllers.Employees.updateContact(req, res);
		} else if (employer) {
			Scheduleme.Controllers.Employers.update(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	});
	app.post('/me/employee', function (req, res) {
		if (employer) {
			// Not sure if this method should be put with employers or employees controllers
			Scheduleme.Controllers.Employers.addEmployee(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	})

	// Uploading Schedules
	app.post('/client-upload', function (req, res) {
		if (employer) {
			Scheduleme.Controllers.Schedules.clientUpload(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	});
	app.post('/upload', function (req, res) {
		if (employer) {
			Scheduleme.Controllers.Schedules.upload(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	});

	app.post('/uploadshifts', function (req, res) {
		if (employer) {
			Scheduleme.Controllers.Schedules.upload(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	})

	app.post('/verifyUpload', function (req, res) {
		Scheduleme.Controllers.Schedules.verifyUpload(req,res);
	});

	//Me
	app.get('/bootstrap', function (req, res) {
		console.log('a');
		console.log(req.session);
		if (employee) { //An employee is signed in
			Scheduleme.Controllers.Employees.bootstrap(req, res); // TODO: Write this function
		} else if (employer) {
			Scheduleme.Controllers.Employers.bootstrap(req, res); //TODO: Write this function
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	});
	
	app.get('/schedules/:date', Scheduleme.Controllers.Schedules.loadDate);

	app.get('/mobile', function (req, res) {
		res.render('mobile', { });
	});

	app.get('/employees', function (req, res) {
		if (employer) {
			Scheduleme.Controllers.Employers.getEmployees(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	})
	app.get('/positions', function (req, res) {
		//if (employer) {
			Scheduleme.Controllers.Employers.getPositions(req, res);
		//} else {
		//	Scheduleme.Helpers.Render.code403(req, res);
		//}
	})
	app.post('/positions', function (req, res) {
		if (employer) {
			Scheduleme.Controllers.Employers.addPosition(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	})
	app.put('/positions/:id', function (req, res) {
		if (employer) {
			Scheduleme.Controllers.Employers.updatePosition(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	})
	app.put('/shift/:id', function (req, res) {
		if (employer) {
			Scheduleme.Controllers.Schedules.updateShift(req, res);
		} else {
			Scheduleme.Helpers.Render.code403(req, res);
		}
	})

	app.get('/testPaste', function (req, res) {
		res.render('testPaste', { title: 'Schedule.me' });
	})

});

app.configure('development', function() {
  app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'), function () {
	console.log('HTTP server listening on %s', app.get('port'));
});