<?php
	if (isset($_GET['dash'])) {
		include ('dash.html');
	} else if (isset($_GET['admin'])) {
		include ('admin.html');
	} else {
		include('welcome.html');
	}
?>
