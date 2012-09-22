<?php
	session_start();

	include ("Log.php");
	//Log activity
	$v = date("Y-m-d");
	$l = &Log::singleton("file","../logs/$v.log");
	$s = array();
	$s['Type']='Logout';
	$l->log(json_encode($s),PEAR_LOG_INFO);

	session_destroy();

	header('Location: /');
?>
