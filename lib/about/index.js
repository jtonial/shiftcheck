
console.log('Loading about pages...');

var express = require('express');
var app = module.exports = express();

var Main = require('../../helpers/global.js');

app.locals({
	site_name: Main.Config.name,
	site_name_lower: Main.Config.name_lower
});

app.set('views', __dirname+'/views');

app.get('/', function (req, res) {
	res.render('about', { title: Main.Config.name, user: req.session, page: 'About' } );
});
app.get('/team', function (req, res) {
	res.render('team', { title: Main.Config.name, user: req.session, page: 'Team'  } );
});
app.get('/security', function (req, res) {
	res.render('security', { title: Main.Config.name, user: req.session, page: 'Security'  } );
});
app.get('/privacy', function (req, res) {
	res.render('privacy', { title: Main.Config.name, user: req.session, page: 'Privacy'  } );
});
app.get('/termsofuse', function (req, res) {
	res.render('termsofuse', { title: Main.Config.name, user: req.session, page: 'Terms Of Use'  } );
});
app.get('/contact', function (req, res) {
	res.render('contact', { title: Main.Config.name, user: req.session, page: 'Contact'  } );
});