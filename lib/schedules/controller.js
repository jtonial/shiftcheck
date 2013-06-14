var Main        = require('../../helpers/global') ,
    crypto      = require('crypto') ,
    _           = require('underscore') ,
    Model       = require('./model.js') ,
    BackboneModel = require('./backbone-model.js') ,
    Collection  = require('./backbone-collection.js') ;

exports.getSchedules = function (req, res) {
  var schedules = new Collection ({});

  schedules.employer_id = req.session.employer_id || req.session.employer;

  schedules.fetch( function (err) {

    var response = {};

    if (err) {
      _.extend(response, err);
      response.statusCode = 500;
    } else {
      response.statusCode = 200;
      _.extend(response, { data: { schedules: schedules.toJSON() } });
    }
    Main.Render.code(req, res, response);
  })
};

exports.getById = function (req, res) {

  var schedule = req.schedule;

  Main.Render.code(req, res, { statusCode: 200, data: schedule.toJSON() } );

};

exports.loadDate = function (req, res){
  if (typeof req.session.employer_id != 'undefined') {//If an employer is signed in

    //This will have to be changed to accomodate different scehdule lengths (ie, 01-15-2013 will match a schedule of length and date 01-12-2013)
    //I feel like this is unstable, but I will use it for now
      //I also need to fetch schedules in which the given date is in the week/twoWeek/month

    var input = {
      id     : req.session.employer_id,
      date   : req.params.date
    }

    Model.getByEmployerDate(input, function (err, result) {
      
      var response = {};

      if (err) {
        response.statusCode = 500;
        response.message = err.code;
        console.log(err.code);
      } else {
        if (result) {
          response.statusCode = 200;
          response.data = result;
        } else {
          response.statusCode = 404;
          response.message = 'No schedule found for that date';
        }
      }
      Main.Render.code(req, res, response);
    });
  } else {
    Main.Render.code403(req,res);
    console.log('Unauthorized access attempt: loadDate schedule');
  }
};

exports.load = function (req, res) {
  if (typeof req.session.employer_id !== 'undefined' || typeof req.session.employee_id !== 'undefined') {
    var input = {
      id : typeof req.session.employer_id !== 'undefined' ? req.session.employer_id : req.session.employee_id,
    }

    Main.Models.Schedule.getByEmployer(input, 
      function (obj) {
        Main.Render.code(req, res, obj)
      });
  } else {
    response = {
      statusCode : 403
    }

    Main.Render.code(req, res, response);

    console.log('Unauthorized access attempt: load schedules');
  }
};

exports.clientUpload = function(req, res) {

  var sendCreds = function (id, key) {
    var createS3Policy;
    var s3Signature;
    var _date, _s3Policy;
    _date = new Date();
    s3Policy = {
      "expiration": "" + (_date.getFullYear()) + "-" + (_date.getMonth() + 1) + "-" + (_date.getDate()) + "T" + (_date.getHours()+12) + ":" + (_date.getMinutes()) + ":" + (_date.getSeconds()) + "Z",
      "conditions": [
        { "bucket": "schedule-me" },
        [ "starts-with", "$key", ""],
        { "acl": "public-read" },
        ["content-length-range", 0, 2147483648],
        ["eq", "$Content-Type", 'application/pdf']
      ]
    };
    var s3PolicyBase64 = new Buffer( JSON.stringify( s3Policy ) ).toString( 'base64' );

    // I should change the redirect to verifyUpload/:id
    var s3Credentials = {
      key: key,
      acl: 'public-read',
      s3PolicyBase64: s3PolicyBase64,
      s3Signature: crypto.createHmac( 'sha1', process.env.AWS_SECRET_ACCESS_KEY || 'I1wqnnTDmK3KyfevxK7y4DD053gcLgGGh/kPTvBr' ).update( s3PolicyBase64 ).digest( 'base64' ),
      s3Key: process.env.AWS_ACCESS_KEY_ID || 'AKIAIKTL23OZ4ILD5TWQ',
      s3Redirect: "http://schedule-me.herokuapp.com/schedules/verifyUpload?x="+id, 
      s3Policy: s3Policy,
      id: id
    };
    res.end(JSON.stringify(s3Credentials));
  };

  var file_name = new Date().getTime().toString(); //Use the current time as key for testing
  var rand = 'dflkasjceo;ajsclkajs'; //Random string
  file_name = crypto.createHmac('sha1', rand).update(file_name).digest('hex')+'.pdf';

  console.log(JSON.stringify(req.body));

  //Validate schedule type; else default to daily
  console.log('Uploading new schedule: Day: '+req.body.date+' Type: '+req.body.type);
  var type = 'day';
  if (req.body.type == 'week' ||
    req.body.type == 'twoweek' ||
    req.body.type == 'month') {
    type = req.body.type;
  }
  var date;
  var tmpDate = new Date(req.body.date);
  if (type == 'day') {
    date = tmpDate;
  } else if (type == 'week') {
    date = tmpDate;
  } else if (type == 'twoweek') {
    date = tmpDate;
  } else if (type == 'month') {
    date = new Date(tmpDate.getFullYear() - tmpDate.getMonth());
  }

  var schedule = new BackboneModel({
    employer_id: req.session.employer_id,
    date: new Date(req.body.date),
    type: type,
    creation_time: Date(),
    image_loc: file_name,
    timezone: req.body.timezone,
    shifts: [],
    json: ''
  });

  schedule.save(function (err) {

    var response = {};

    if (err) {
      if (schedule._invalid) {
        response.statusCode = 400;
      } else {
        response.statusCode = 500;
      }
      response.error        = err;

      Main.Render.code(req, res, response )

    } else {
      sendCreds(schedule.id, file_name);
    }


  });

};

//This seems to work for uploading a pdf and adding a schedule to a database
exports.upload = function(req, res) { //Used to process a file containing a schedule

  //Determine the type of file
  //Parse the file based on the given type

  var type = 'day';
  if (req.body.type == 'week' ||
    req.body.type == 'twoweek' ||
    req.body.type == 'month') {
    type = req.body.type;
  }
  var date;
  var tmpDate = new Date(req.body.date);
  if (type == 'day') {
    date = tmpDate;
  } else if (type == 'week') {
    date = tmpDate;
  } else if (type == 'twoweek') {
    date = tmpDate;
  } else if (type == 'month') {
    date = new Date(tmpDate.getFullYear() - tmpDate.getMonth());
  }

  console.log(req.body.date);

  var schedule = new BackboneModel({
    employer_id: req.session.employer_id,
    date: new Date(req.body.date),
    type: type,
    creation_time: Date(),
    image_loc: '',
    timezone: req.body.timezone,
    shifts: req.body.shifts || [],
    json: req.body.json
  });

  schedule.save(function (err) {

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
      response.id           = schedule.id;
    }

    Main.Render.code(req, res, response )

  });

};

exports.verifyUpload = function (req, res) {

  var id = req.body.x || req.query.x;

  if (typeof id != 'undefined') {
    console.log('Verifying schedule: '+id);
    //This update hangs and i'm not sure why.... I feel like it may be because it doens't have a db connection but I cant seem to figure it out
    Model.verifyUpload(id, function (obj) {

      err   = obj.err;
      result   = obj.result;

      if (err) {
        Main.Logger.error(err);
        Main.Render.code(req.xhr, res, { statusCode: 500 } );
      } else {
        Main.Render.code(req.xhr, res, { statusCode: 200 } );
      }
    });
  } else {
    //Do nothing, no parameter supplied
    console.log('No id provided');
    Main.Render.code(req.xhr, res, { statusCode: 400 } );
  }
};

exports.publish = function (req, res) {
  var obj = {
    employer_id: req.session.employer_id,
    schedule_id: req.params.schedule_id
  }

  Model.publish(obj, function (err, response) {
    Main.Render.code(req, res, response);
  });
};

exports.unpublish = function (req, res) {
  var obj = {
    employer_id: req.session.employer_id,
    schedule_id: req.params.schedule_id
  }

  Model.unpublish(obj, function (err, response) {
    Main.Render.code(req, res, response);
  });
};


exports.update = function (req, res) {
  var obj = {
    employer_id: req.session.employer_id,
    schedule_id: req.params.schedule_id,
    timezone : req.body.timezone
  }

  Model.update(obj, function (err, response) {
    Main.Render.code(req, res, response);
  });
};
