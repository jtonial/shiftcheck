
require(__basedir+'/helpers/logger').info('Loading memcached connection...');

var Main = require('../helpers/global');

//I'm not sure why Config doesn't seem to be set at this point but this hack works for now
Main.Config = require('../config');

var Memcached = require('memcached');

var memcached = new Memcached(Main.Config.memcached.serverLocations, Main.Config.memcached.options);
memcached.on('issue', function( details ){ sys.error( "Server " + details.server + "has an issue due to: " + details.messages.join( '' ) ) });
memcached.on('failure', function( details ){ sys.error( "Server " + details.server + "went down due to: " + details.messages.join( '' ) ) });
memcached.on('reconnecting', function( details ){ sys.debug( "Total downtime caused by server " + details.server + " :" + details.totalDownTime + "ms")});

module.exports = memcached;
