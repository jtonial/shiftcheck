config = {

  "name" : "Shift-check",
  "name_lower": "shift-check",

  "port" : 3100,
  "ssl_port" : 3101,

  "debug": true,

  "facebook_url" : '',
  "twitter_url" : '',

  "session_secret" : "asdfadsfasdfw4t3t53"
}

config.mongo = require('./mongo')
config.mysql = require('./mysql');

module.exports = config;
