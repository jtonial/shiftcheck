var bouncy = require('bouncy');

bouncy(function (req, bounce) {
	console.log('bouncing....');
	bounce(8000);
}).listen(80);
