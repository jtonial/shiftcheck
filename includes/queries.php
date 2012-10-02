<?php
	/*
	 * This file creates an array containing string sprites of all queries used to interact with the database.
	 */

	$queries = array ();

	$queries['employers'] = array ();
	$queries['positions'] = array ();
	$queries['employees'] = array ();
	$queries['shifts'] = array ();
	$queries['upforgrabs'] = array ();

	$queries['employers']['select'] = "";
	$queries['employers']['insert'] = "INSERT INTO `employers` (`name`,`login_name`,`email`,`password`) VALUES ('%s','%s','%s','%s')";
	$queries['employers']['update'] = "";
	$queries['employers']['delete'] = "";

	$queries['employers']['selectById'] = "SELECT * FROM `employers` WHERE employer_id='%s'";
	$queries['employers']['updatePassword'] = "UPDATE `employers` SET password='%s' WHERE employer_id='%s' AND password='%s'";
	$queries['employers']['schedule'] = "SELECT s.shift_id as id,s.employer_id,s.date,s.start_time,s.end_time,s.position,s.employee_id,e.name, e.enumber, e.phone FROM shifts as s JOIN employees as e USING (employee_id) WHERE date=DATE('%s') and s.employer_id='%s' ORDER BY date,start_time ASC";

	$queries['positions']['select'] = "";
	$queries['positions']['insert'] = "INSERT INTO `positions` (`employer_id`,`title`) VALUES ('%s','%s')";
	$queries['positions']['update'] = "";
	$queries['positions']['delete'] = "";

	$queries['employees']['select'] = "";
	$queries['employees']['insert'] = "INSERT INTO `employees` (`employer_id`,`fname`,`lname`,`emp_number`,`email`,`phone`,`password`,`emp_pass_set`) VALUES ('%s','%s','%s','%s','%s','%s','%s',0)";
	$queries['employees']['update'] = "";
	$queries['employees']['delete'] = "";

	$queries['employees']['updatePassword'] = "UPDATE `employees` SET password='%s' WHERE employee_id='%s' AND password='%s'";
	$queries['employees']['']="";

	$queries['shifts']['select'] = "";
	$queries['shifts']['insert'] = "INSERT INTO `shifts` (`employer_id`,`date`,`start_time`,`end_time`,`employee_id`,`position_id`) VALUES ('%s','%s','%s','%s','%s','%s')";
	$queries['shifts']['update'] = "";
	$queries['shifts']['delete'] = "";


	$queries['upforgrabs']['select'] = "SELECT * FROM `upforgrabs` JOIN `shifts` USING (shift_id) WHERE employer_id='%s'";
	$queries['upforgrabs']['insert'] = "";
	$queries['upforgrabs']['update'] = "";
	$queries['upforgrabs']['delete'] = "";

	$queries['upforgrabs']['selectById'] = "";

	$queries['change_requests']['select'] = "";
	$queries['change_requests']['insert'] = "INSERT INTO `change_requests` (`shift_id`,`from_employee`,`to_employee`,`request_time`) VALUES ('%s','%s','%s',NOW())";
	$queries['change_requests']['update'] = "";
	$queries['change_requests']['delete'] = "";

	$queries['change_requests']['makeDecision'] = "UPDATE `change_requests` SET decision='%s',decision_time=NOW(),decision_by='%s' WHERE change_id='%s'";

?>
