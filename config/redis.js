/* 
  Docs: https://github.com/3rd-Eden/node-memcached
*/

require(__basedir+'/helpers/logger').info('Loading redis engine...');

var redis = {};

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  redis.port      = rtg.port;
  redis.hostname  = rtg.hostname;

  redis.password  = rtg.auth.split(":")[1];

} else {
  redis.port      = 6379;
  redis.hostname  = '127.0.0.1';
}

module.exports = redis;
