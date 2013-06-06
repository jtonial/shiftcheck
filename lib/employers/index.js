
console.log('Loading employer engine...');

var express   = require('express') ,
    Main      = require('../../helpers/global.js') ,
    app       = module.exports = express();

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


app.get('/', employerOnly, function (req, res) {
  Main.Controllers.Employers.getEmployees(req, res);
})
app.post('/', employerOnly, function (req, res) {
  Main.Controllers.Employers.addEmployee(req, res);
})
app.delete('/:id', employerOnly, function (req, res) {
  Main.Controllers.Employers.deleteEmployee(req, res);
})