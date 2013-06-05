
console.log('Loading shift engine...');

var express     = require('express') ,
    Main        = require('../../helpers/global.js'),
    app         = module.exports = express() ,
    Controller  = require('./controller.js') ;

app.locals(Main.Config.views);

//app.set('views', __dirname+'/views');

// Check that session is employer, or respond with 403
var employerOnly = function (req, res, next) {
  if (admin) {
    next();
  } else {
    Main.Render.code403(req, res);
  }
}

app.post('/',       employerOnly, Controller.addShift );
app.put('/:id',     employerOnly, Controller.updateShift );

app.delete('/:id',  employerOnly, Controller.deleteShift );
