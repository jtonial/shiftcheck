var bouncy = require('bouncy');

bouncy(function (req, bounce) {
  if (req.headers.host === 'localhost') {
		console.log('Request to localhost; bouncing to 3002');
		bounce(3002);
	}
	else if (req.headers.host === 'api.localhost') {
		console.log('Request to api.localhost; bouncing to 8001');
		bounce(8001);
	}
}).listen(80);
