/*
  Global helper methods. Can all be used blackbox
*/

console.log('Loading general helpers...');

var Main = require('../helpers/global') ;

var crypto = require('crypto') ,
    bcrypt = require('bcrypt') ;

exports.generateSalt = function () {
  var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 40; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

exports.calcHash = function (val, suppliedSalt) {
  var shasum = crypto.createHash('sha1');
  var salt = typeof suppliedSalt != 'undefined' ? suppliedSalt : 'schedule12101991';

  return shasum.update(val+salt).digest('hex');
};
// bcrypt
exports.hash = {
  calc    : function (val, suppliedSalt) {
    return  bcrypt.hashSync(val, Main.Config.password_rounds_bcrypt);
  },
  compare : function (val, hash) {
    return bcrypt.compareSync(val, hash);
  }
}

exports.is_email = function (email) {
  var reg_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg_email.test(email);
};
exports.getClientIp = function(req) {
  var ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  var forwardedIpsStr = req.header('x-forwarded-for'); 
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};
/*
  Global helper method to validate passwords
    New passwords constraints can be added here
*/
exports.validatePassword = function (password) {
  if (password.length < 6) {
    return false;
  }

  return true;
}

// Middleware helpers

exports.signedInOnly = function (req, res, next) {
  if (req.user.user_id) {
    next()
  } else {
    Main.Render.code(req, res, { statusCode : 401 });
  }
}
