
console.log('Loading position engine...');

var express     = require('express') ,
    Main        = require('../../helpers/global.js') ,
    Controller  = require('./controller.js') ,
    app         = module.exports = express();

app.locals(Main.Config.views);


// Check that session is employer, or respond with 403
  // Note that the query itself checks that the position belongs to the current employer
  // This will eventually be changed to a 'hasPermission' check, allowing for (possibly) multiple people have to permission
var employerOnly = function (req, res, next) {
  if (admin) {
    next();
  } else {
    Main.Render.code403(req, res);
  }
}


app.get('/', function (req, res) {
  Controller.getPositions(req, res);
})
app.post('/', employerOnly, function (req, res) {
  Controller.addPosition(req, res);
})
app.put('/:id', employerOnly, function (req, res) {
  Controller.updatePosition(req, res);
})
// This uses a soft delete to prevent foreign key problems with shifts on old schedules
app.delete('/:id', employerOnly, function (req, res) {
  Controller.deactivatePosition(req, res);
})