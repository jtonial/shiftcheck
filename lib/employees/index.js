
console.log('Loading employee engine...');

var express     = require('express') ,
    Main        = require('../../helpers/global.js') ,
    Controller  = require('./controller') ,
    app         = module.exports = express();

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


//app.use( employerOnly );


app.get('/',        [ employerOnly ], Main.Controllers.Employers.getEmployees )
app.post('/',       [ employerOnly ], Controller.addEmployee )
app.delete('/:id',  [ employerOnly ], Controller.deleteEmployee )
