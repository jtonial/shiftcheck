
require(__basedir+'/connections/logger').info('Loading server engine...');

module.exports = config = {

  port         : 3100,
  ssl_port     : 3101,

  debug        : true,
  
  session_secret : "asdfadsfasdfw4t3t53",
  
  cluster : false,
  password_rounds_bcrypt : 10

};
