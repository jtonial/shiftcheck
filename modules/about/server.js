
require(__basePath+'/connections/logger').info('Loading about pages...');

var express   = require('express') ,
    Main      = require(__basePath+'/main.js') ,
    app       = module.exports = express();

app.locals(Main.Config.views);


app.set('views', __dirname+'/views');

app.get('/',          function (req, res) {
  res.render('about', { user: req.session, page: 'About' } );
});
app.get('/team',      function (req, res) {
  res.render('team', { user: req.session, page: 'Team'  } );
});
app.get('/security',  function (req, res) {
  res.render('security', { user: req.session, page: 'Security'  } );
});
app.get('/privacy',   function (req, res) {
  res.render('privacy', { user: req.session, page: 'Privacy'  } );
});
app.get('/termsofuse', function (req, res) {
  res.render('termsofuse', { user: req.session, page: 'Terms Of Use'  } );
});
app.get('/contact',   function (req, res) {
  res.render('contact', { user: req.session, page: 'Contact'  } );
});