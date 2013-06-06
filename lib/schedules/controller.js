var Main        = require('../../helpers/global') ,
    crypto      = require('crypto') ,
    _           = require('underscore') ,
    Model       = require('./model.js') ;

exports.getById = function (req, res) {
  if (typeof req.session.employer_id != 'undefined') {//If an employer is signed in

    var input = {
      schedule_id : req.params.schedule_id,
      employer_id : req.session.employer_id
    }

    Model.getById(input, function (err, result) {
      
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
          response.message = 'No schedule found for that id';
        }
      }
      Main.Render.code(req.xhr, res, response);
    });
  } else {
    Main.Render.code403(req,res);
    console.log('Unauthorized access attempt: getById schedule');
  }

}
exports.loadDate = function (req, res){
  if (typeof req.session.employer_id != 'undefined') {//If an employer is signed in
    console.log('Load Schedule: Employer: '+req.session.employer_id+' Date: '+req.params.date);

    //This will have to be changed to accomodate different scehdule lengths (ie, 01-15-2013 will match a schedule of length and date 01-12-2013)
    //I feel like this is unstable, but I will use it for now
      //I also need to fetch schedules in which the given date is in the week/twoWeek/month

    var input = {
      id     : req.session.employer_id,
      date   : req.params.date
    }

    Main.Models.Schedule.getByEmployerDate(input, function (err, result) {
      
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
      Main.Render.code(req.xhr, res, response);
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

    console.log('Load Schedule for EmployerID: '+input.id);

    Main.Models.Schedule.getByEmployer(input, 
      function (obj) {
        Main.Render.code(req.xhr, res, obj)
      });
  } else {
    response = {
      statusCode : 403
    }

    Main.Render.code(req.xhr, res, response);

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

  var schedule = Main.Models.Schedule.new({
    employer_id: req.session.employer_id,
    date: new Date(req.body.date),
    type: type,
    creation_time: Date(),
    image_loc: file_name,
    timezone: req.body.timezone,
    shifts: []//shifts
  });

  schedule.save(function (err, result) {
    if (!err) {
      console.log('New Schedule created: id: '+result.insertId);
      sendCreds(result.insertId, file_name);
    } else { //There was an error
      if (err.error == 'CONFLICT') {
        Main.Render.code(req.xhr, res, { statusCode : 400, message: err.message });
        return;
      } 
      console.log('There was an error creating a schedule: '+err);
      Main.Render.code500(req,res);
    }
  });
};

exports.verifyUpload = function (req, res) {

  var id = req.body.x || req.query.x;

  if (typeof id != 'undefined') {
    console.log('Verifying schedule: '+id);
    //This update hangs and i'm not sure why.... I feel like it may be because it doens't have a db connection but I cant seem to figure it out
    Main.Models.Schedule.verifyUpload(id, function (obj) {

      err   = obj.err;
      result   = obj.result;

      console.log('update complete of schedule: '+id);
      if (err) {
        console.log('Error updating awaiting upload status: '+err);
        Main.Render.code ( req.xhr, res, { statusCode: 500 } );
      } else {
        if (result.affectedRows) {
          //Main.Render.uploadVerified(req, res);
        } else {
          //Nothing changed... for now just do the same
        }
        Main.Render.code ( req.xhr, res, { statusCode: 200 } );
      }
    });
  } else {
    //Do nothing, no parameter supplied
    console.log('No id provided');
    Main.Render.code ( req.xhr, res, { statusCode: 400 } );
  }
};
//This seems to work for uploading a pdf and adding a schedule to a database
exports.upload = function(req, res){ //Used to process a file containing a schedule

  if (typeof req.session.employer_id != 'undefined') {
    //Determine the type of file
    //Parse the file based on the given type

    //For MVP we only use PDFs
    //if (typeof req.files.schedule != 'undefined') {
      // TODO: validate the upload file

    
    //if (typeof req.body.shifts != 'undefined' || typeof req.body.json != 'undefined') {
    //Allow a schedule with no shifts to be uploaded so it can be added to
    //if (typeof req.body.json != 'undefined') {

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

      var schedule = Main.Models.Schedule.new({
        employer_id: req.session.employer_id,
        date: new Date(req.body.date),
        type: type,
        creation_time: Date(),
        image_loc: '',
        timezone: req.body.timezone,
        shifts: req.body.shifts || [],
        json: req.body.json
      });

      schedule.save(function (err, result) {
        if (!err) {
          console.log('New Schedule created: id: '+result.insertId);
          Main.Render.code( req.xhr, res, {statusCode: 200, schedule_id: result.insertId } );
        } else { //There was an error
          if (err.error == 'CONFLICT') {
            Main.Render.code(req.xhr, res, { statusCode : 400, message: err.message });
            return;
          } 
          console.log('There was an error creating a schedule: '+err);
          Main.Render.code500(req,res);
        }
      });

    /*} else {
      res.statusCode = 400;
      res.end('No schedule provided');
    }*/
  } else {
    response = {
      statusCode: 403
    }
    Main.Render.code( req.xhr, res, response);
  }
};

exports.publish = function (req, res) {
  var obj = {
    employer_id: req.session.employer_id,
    schedule_id: req.params.schedule_id
  }

  Main.Models.Schedule.publish(obj, function (err, response) {
    Main.Render.code(req.xhr, res, response);
  })
};

exports.unpublish = function (req, res) {
  var obj = {
    employer_id: req.session.employer_id,
    schedule_id: req.params.schedule_id
  }

  Main.Models.Schedule.unpublish(obj, function (err, response) {
    Main.Render.code(req.xhr, res, response);
  })
};