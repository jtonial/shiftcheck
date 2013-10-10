
//var Main = require('../helpers');

/*exports.placeholder = function () {
  console.log('Logger placeholder');
};*/
var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        timestamp : true,
        colorize  : true,
        level     : 'debug',
        silent    : false
      }),
      new (winston.transports.File)({ 
        filename  : 'somefile.log',
        timestamp : true,
        colorize  : true,
        level     : 'debug',
        silent    : true
      })
    ]
});

// This has to be at the end (as opposed to the log in all other files) or else it will be requiring itself and crash weirdly
logger.info('Loading logger helpers...');

module.exports = logger;
