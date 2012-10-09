var bouncy = require('bouncy');

console.log('Bouncy listening on post 80');

bouncy(function (req, bounce) {
	console.log('bouncing....');
	bounce(8000);
}).listen(80);
