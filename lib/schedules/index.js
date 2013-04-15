console.log('Loading schedule engine...');

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

// Uploading Schedules
app.post('/client-upload', function (req, res) {
	if (employer) {
		Main.Controllers.Schedules.clientUpload(req, res);
	} else {
		Main.Helpers.Render.code403(req, res);
	}
});
app.post('/upload', function (req, res) {
	if (employer) {
		Main.Controllers.Schedules.upload(req, res);
	} else {
		Main.Helpers.Render.code403(req, res);
	}
});

app.post('/uploadshifts', function (req, res) {
	if (employer) {
		Main.Controllers.Schedules.upload(req, res);
	} else {
		Main.Helpers.Render.code403(req, res);
	}
})

app.post('/verifyUpload', function (req, res) {
	Main.Controllers.Schedules.verifyUpload(req,res);
});

app.get('/schedules/:date', Main.Controllers.Schedules.loadDate);
