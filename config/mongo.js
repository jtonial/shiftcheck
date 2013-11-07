
require(__basedir+'/helpers/logger').info('Loading mongo engine...');

var mongo;

var mongo_config = {
  local   : {
    host       : "localhost",
    port       : 27017,
    database   : "schedule"
  }
};

// Determine where to connect to; for now I do not have a remote mongo as I dont really use it
mongo = mongo_config.local;

module.exports = mongo;
