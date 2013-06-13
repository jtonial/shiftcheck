console.log('Loading render helpers...');

var Main = require('../helpers/global');

exports.renderLoginPage = function (req, res) {
  res.render('login', { } );
};

exports.renderAdminloginPage = function (req, res) {
  res.render('manager-login', { } );
};

exports.renderSignup = function (req, res) {
  res.render('signup', {  } );
};

exports.index = function(req, res){
  res.setHeader('Content-Type','text/html');

  if (typeof req.session.employee_id != 'undefined') {
    if (req.device.type == 'phone' || req.device.type == 'tablet') {
      res.render('jquerymobile', { } );
    } else {
      res.render('newdash', { user: req.session });
    }
  } else if (typeof req.session.employer_id != 'undefined') { //It is an employer signed in
    res.render('newdash', { user: req.session });
  } else {
    res.render('landing', { user: req.session });
  }

};

//Codes
exports.code = function (req, res, obj) {
  // I should put certain attributes into their own objects here (meta?)
    // statusCode
    // message
    // startTime
    // endTime
    // duration

  res.statusCode = obj.statusCode;
  delete obj.statusCode;

  //if (req.xhr) {
    res.header('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  /*} else {
    switch (obj.statusCode) {
      case 200: // Okay
        res.header('Content-Type', 'application/json');
        res.end(JSON.stringify(obj));
        break;
      case 201: // Created
        res.header('Content-Type', 'application/json');
        res.end(JSON.stringify(obj));
        break;
      default:
        res.render(res.statusCode, { } );
        break;

    }
  }*/
};
exports.code401 = function (req, res) {
  res.statusCode = 401;
  if (req.xhr) {
    res.end();
  } else {
    res.render('401', { } );
  }
};
exports.code403 = function (req, res) {
  res.statusCode = 403;
  if (req.xhr) {
    res.end();
  } else {
    res.render('403', { } );
  }
};
exports.code404 = function (req, res) {
  res.statusCode = 404;
  if (req.xhr) {
    res.end();
  } else {
    res.render('404', { } );
  }
};
exports.code500 = function (req, res) {
  res.statusCode = 500;
  if (req.xhr) {
    res.end();
  } else {
    res.render('500', { } );
  }
};