<?php
	session_start();

	if (isset($_SESSION['employee_id']) || isset($_GET['dash'])) {
		include ('dash.html');
	} else if (isset ($_SESSION['employer_id']) || isset($_GET['admin'])) {
		include ('admin.html');
	} else {
		include('welcome.html');
	}
?>
