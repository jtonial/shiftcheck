var _ = require('underscore');

var config = {};

// Perhaps this shouldn't be extended, and should instead be like 'config.server = require('./server'); this will require all the usages throughout the code to change
_.extend(config, require('./server'));
_.extend(config, require('./views'));

_.extend(config, {
  views : require('./views') ,
  mongo : require('./mongo') ,
  mysql : require('./mysql') ,
  
  redis : require('./redis') ,
  memcached : require('./memcached')
});


module.exports = config;
