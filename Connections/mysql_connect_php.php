<?php
//This function is used to connect to the nrmitchi_php database as the php user

$dbuser = "nrmitchi_schedul";
$dbhost = "localhost";
$dbpassword = "asdF456^";

$dbphp = mysql_connect($dbhost, $dbuser, $dbpassword);
//I have to select which database to use; it should be nrmitchi_php.
if (!$dbphp) {
	//Display an error to the user
	alert("We are currently experiencing technical difficulties. We apologize for any inconvenience.");
	//Log the error and send an email to.... someone
} else {
	mysql_select_db('nrmitchi_schedule',$dbphp); //Select the database
}

?>
