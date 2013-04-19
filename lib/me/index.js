console.log('Loading me engine...');

var express = require('express');
var app = module.exports = express();

var Main = require('../../helpers/global.js');

app.locals({
	site_name: Main.Config.name,
	site_name_lower: Main.Config.name_lower,

	facebook_url: Main.Config.facebook_url,
	twitter_url: Main.Config.twitter_url
});

app.set('views', __dirname+'/views');


app.get('/bootstrap', function (req, res) {
	if (employee) { //An employee is signed in
		Main.Controllers.Employees.bootstrap(req, res); // TODO: Write this function
	} else if (admin) {
		Main.Controllers.Employers.bootstrap(req, res); //TODO: Write this function
	} else {
		Main.Helpers.Render.code403(req, res);
	}
});

app.post('/me/changePassword', function (req,res) {
	if (employee) {
		Main.Controllers.Employees.changePassword(req, res);
	} else if (admin) {
		Main.Controllers.Employers.changePassword(req, res);
	} else {
		Main.Helpers.Render.code403(req, res);
	}
});

app.post('/me/update', function (req, res) {
	if (employee) {
		Main.Controllers.Employees.updateContact(req, res);
	} else if (admin) {
		Main.Controllers.Employers.update(req, res);
	} else {
		Main.Helpers.Render.code403(req, res);
	}
});