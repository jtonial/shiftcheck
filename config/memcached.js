/* 
  Docs: https://github.com/3rd-Eden/node-memcached
*/

require(__basedir+'/helpers/logger').info('Loading memcached engine...');

var memcached;

var server_locations = {
  'localhost:11211' : 1
};

var options = {};

exports.serverLocations = server_locations;
exports.options         = options;