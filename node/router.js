var bouncy = require('bouncy');

console.log('Bouncy listening on port 80');

bouncy(function (req, bounce) {
	console.log('bouncing....');
	bounce(8000);
}).listen(80);
