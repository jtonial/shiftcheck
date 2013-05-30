
console.log('Loading about pages...');

var express   = require('express') ,
    Main      = require('../../helpers/global.js') ,
    app       = module.exports = express();

app.locals({
  site_name: Main.Config.name,
  site_name_lower: Main.Config.name_lower,

  title: Main.Config.name,

  facebook_url: Main.Config.facebook_url,
  twitter_url: Main.Config.twitter_url
});

app.set('views', __dirname+'/views');

app.get('/', function (req, res) {
  res.render('about', { user: req.session, page: 'About' } );
});
app.get('/team', function (req, res) {
  res.render('team', { user: req.session, page: 'Team'  } );
});
app.get('/security', function (req, res) {
  res.render('security', { user: req.session, page: 'Security'  } );
});
app.get('/privacy', function (req, res) {
  res.render('privacy', { user: req.session, page: 'Privacy'  } );
});
app.get('/termsofuse', function (req, res) {
  res.render('termsofuse', { user: req.session, page: 'Terms Of Use'  } );
});
app.get('/contact', function (req, res) {
  res.render('contact', { user: req.session, page: 'Contact'  } );
});