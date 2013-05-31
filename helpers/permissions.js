console.log('Loading permission helpers...');

/*
  I will have to give some thought to how I want to do this. I can easily make permissions for each object, but then object classes should need
  permissions as well (such as GET /schedules, or searching by date). For searching by date I will likely have to search for the schedule, then
  check permissions after fetching it (but before fetching shifts)....
*/
var Main  = require('../helpers/global') ,
    db    = require('../db/dbconnection') ,
    cache = require('../helpers/cache') ;

// Permission to access a given schedule

// Permission to modify a given schedule

// Permission to modify a shift

function shiftUpdate (obj) {
  return true;
}

exports.load  = function (req, res, next) {
  // Break URL
  var splitPath = req.path.split('/');

  req.entity = {
    entity    : splitPath[1],
    entity_id : splitPath[2]
  }

  Main.Logger.info('Entity: '+JSON.stringify(req.entity));

  next();
}
exports.check = function (obj) {

  // TODO: Validate that object attributes exist

  /*
  var model   = obj.entity;
  var session = obj.session;
  var action  = obj.action;
  */

  return true;
}