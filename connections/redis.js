
require(__basedir+'/connections/logger').info('Loading redis connection...');

var Main = require(__basedir+'/main.js');

//I'm not sure why Config doesn't seem to be set at this point but this hack works for now
Main.Config = require('../config');

var Redis = require('redis');
var redis = Redis.createClient(Main.Config.redis.port, Main.Config.redis.hostname);

if (Main.Config.redis.password) {
  redis.auth(Main.Config.redis.password);
}

//console.log(Main.Config.redis);

module.exports = redis;
