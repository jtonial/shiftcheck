
// Set a global reference to the base directory (mostly used for referencing views/includes)
global.__basePath = __dirname;
console.log('Executing with base dir: '+__basePath);

var cluster     = require('cluster') ,
    Main        = require('./main.js') ;

// TODO: Determine where to set globals
// require('./globals.js');

if (cluster.isMaster && Main.Config.cluster) {
  // Count the machine's CPUs
  var cpuCount = require('os').cpus().length;

  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i += 1) {
      cluster.fork();
  }
  cluster.on('exit', function (worker) {

    // Replace the dead worker,
    console.log('Worker ' + worker.id + ' died :(');
    cluster.fork();

  });
} else {
  require('./worker.js');
}
