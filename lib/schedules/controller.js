var Main        = require(__basedir+'/helpers/global') ,
    crypto      = require('crypto') ,
    _           = require('underscore') ,
    Schedule    = require('./model.js') ,
    Schedules   = require('./collection.js') ,
    Shift       = require('./lib/shifts/model.js') ,
    Shifts      = require('./lib/shifts/collection.js') ;

exports.index = function (req, res) {
  var schedules = new Schedules();

  schedules.employer_id = req.user.employer_id;

  schedules.fetch( function (err) {

    var response = {};

    if (err) {
      _.extend(response, err);
      response.statusCode = 500;
    } else {
      response.statusCode = 200;
      if (req.user.admin) {
        _.extend(response, { data: { schedules: schedules.toJSON() } });
      } else { // Only return published schedules
        _.extend(response, { data: { schedules: (new Schedules(schedules.filter( function (schedule) { return schedule.get('published')} ))).toJSON() }})
      }
    }
    Main.Render.code(req, res, response);
  })
};

exports.show = function (req, res) {

  var schedule = req.schedule;

  Main.Render.code(req, res, { statusCode: 200, data: schedule.toJSON() } );

};

// exports.loadDate = function (req, res){
//   if (typeof req.session.employer_id != 'undefined') {//If an employer is signed in

//     //This will have to be changed to accomodate different scehdule lengths (ie, 01-15-2013 will match a schedule of length and date 01-12-2013)
//     //I feel like this is unstable, but I will use it for now
//       //I also need to fetch schedules in which the given date is in the week/twoWeek/month

//     var input = {
//       id     : req.session.employer_id,
//       date   : req.params.date
//     }

//     Model.getByEmployerDate(input, function (err, result) {
      
//       var response = {};

//       if (err) {
//         response.statusCode = 500;
//         response.message = err.code;
//         console.log(err.code);
//       } else {
//         if (result) {
//           response.statusCode = 200;
//           response.data = result;
//         } else {
//           response.statusCode = 404;
//           response.message = 'No schedule found for that date';
//         }
//       }
//       Main.Render.code(req, res, response);
//     });
//   } else {
//     Main.Render.code403(req,res);
//     console.log('Unauthorized access attempt: loadDate schedule');
//   }
// };

exports.create = function (req, res) {
  console.log('creating');
  var schedule = new Schedule();

  console.log(req.body.date);

  schedule.set({
    employer_id : req.user.employer_id ,
    date        : new Date(req.body.date) ,
    timezone    : req.body.timezone
  });

  schedule.save( function (err, result) {

    var response = {};

    if (err) {
      if (schedule._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;
    } else {
      response.statusCode   = 201;
      response.id           = schedule.id;
    }

    Main.Render.code(req, res, response);

  });
};

exports.update = function (req, res) {

  var schedule = req.schedule;
  
  Main.Render.code(req, res, { statusCode : 405 });
  
};


exports.publish = function (req, res) {
  var schedule = req.schedule;
  
  schedule.set({
    published : true
  });

  schedule.save( function (err, result) {

    var response = {};

    if (err) {
      if (schedule._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;
    } else {
      response.statusCode   = 200;
    }

    Main.Render.code(req, res, response);

  });
};

exports.unpublish = function (req, res) {
  var schedule = req.schedule;
  
  schedule.set({
    published : false
  });

  schedule.save( function (err, result) {

    var response = {};

    if (err) {
      if (schedule._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;
    } else {
      response.statusCode   = 200;
    }

    Main.Render.code(req, res, response);

  });
};


