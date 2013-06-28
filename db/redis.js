console.log('Loading redis connection...');

var Main = require('../helpers/global');

//I'm not sure why Config doesn't seem to be set at this point but this hack works for now
Main.Config = require('../config');

var Redis = require('redis');
var redis = Redis.createClient(Main.Config.redis.port, Main.Config.redis.hostname);

if (redis.password) {
  redis.auth(Main.Config.redis.password);
}

module.exports = redis;
