
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


app.get('/',        Controller.getPositions )
app.post('/',       [ employerOnly ], Controller.addPosition )
app.put('/:id',     [ employerOnly ], Controller.updatePosition )
app.delete('/:id',  [ employerOnly ], Controller.deactivatePosition )