<?php

	require_once('mysql.php');
	require_once('queries.php');

	class schedule_mysql extends mysql {

		function employersSelect () {
			return mysql_query(sprintf($queries['employers']['select'], ));
		}
		function employersInsert ($name,$login_name,$email,$password) {
			return mysql_query(sprintf($queries['employers']['insert'], $name, $login_name, $email, $password));
		}
		function employersUpdate () {
			return mysql_query(sprintf($queries['employers']['update'], ));
		}
		function employersDelete () {
			return mysql_query(sprintf($queries['employers']['delete'], ));
		}
		function employersSelectById ($employerid) {
			return mysql_query(sprintf($queries['employers']['selectById'], $employerid));
		}
		function employersUpdatePassword ($newpassword,$employerid,$oldpassword) {
			return mysql_query(sprintf($queries['employers']['updatePassword'], $newpassword, $employerid, $oldpassword));
		}
		function employersSchedule ($date,$employerid) {
			return mysql_query(sprintf($queries['employers']['schedule'], $date, $employerid));
		}

		function positionsSelect () {
			return mysql_query(sprintf($queries['positions']['select'], ));
		}
		function positionsInsert ($employer_id,$title) {
			return mysql_query(sprintf($queries['positions']['insert'], ));
		}
		function positionsUpdate () {
			return mysql_query(sprintf($queries['positions']['update'], ));
		}
		function positionsDelete () {
			return mysql_query(sprintf($queries['positions']['delete'], ));
		}

		function employeesSelect () {
			return mysql_query(sprintf($queries['employees']['select'], ));
		}
		function employeesInsert ($employer_id,$fname,$lname,$emp_number,$email,$phone,$password) {
			return mysql_query(sprintf($queries['employees']['insert'], $employer_id, $fname, $lname, $emp_number, $email, $phone, $password));
		}
		function employeesUpdate () {
			return mysql_query(sprintf($queries['employees']['update'], ));
		}
		function employeesDelete () {
			return mysql_query(sprintf($queries['employees']['delete'], ));
		}
		function employeesUpdatePassword ($newpassword,$employerid,$oldpassword) {
			return mysql_query(sprintf($queries['employees']['updatePassword'], $newpassword, $employerid, $oldpassword));
		}
		function employeesSchedule ($employeeid) {
			return mysql_query(sprintf($queries['employees']['schedule'], $employeeid)):
		}

		function shiftsSelect () {
			return mysql_query(sprintf($queries['shifts']['select'], ));
		}
		function shiftsInsert ($employerid,$date,$starttime,$endtime,$employeeid,$positionid) {
			return mysql_query(sprintf($queries['shifts']['insert'], $employerid, $date, $starttime, $endtime, $employeeid, $positionid));
		}
		function shiftsUpdate () {
			return mysql_query(sprintf($queries['shifts']['update'], ));
		}
		function shiftsDelete () {
			return mysql_query(sprintf($queries['shifts']['delete'], ));
		}

		function upforgrabsSelect ($employerid) {
			return mysql_query(sprintf($queries['upforgrabs']['select'], $employerid));
		}
		function upforgrabsInsert () {
			return mysql_query(sprintf($queries['upforgrabs']['insert'], ));
		}
		function upforgrabsUpdate () {
			return mysql_query(sprintf($queries['upforgrabs']['update'], ));
		}
		function upforgrabsDelete () {
			return mysql_query(sprintf($queries['upforgrabs']['delete'], ));
		}
		function upforgrabsSelectById () {
			return mysql_query(sprintf($queries['upforgrabs']['selectById'], ));
		}

		function changereqestsSelect () {
			return mysql_query(sprintf($queries['change_requests']['select'], ));
		}
		function changereqestsInsert ($shiftid,$fromemployee,$toemployee) {
			return mysql_query(sprintf($queries['change_requests']['insert'], $shiftid, $fromemployee, $toemployee));
		}
		function changereqestsUpdate () {
			return mysql_query(sprintf($queries['change_requests']['update'], ));
		}
		function changereqestsDelete () {
			return mysql_query(sprintf($queries['change_requests']['delete'], ));
		}
		function employersMakeDecision ($decision,$decisionby) {
			return mysql_query(sprintf($queries['change_requests']['makeDecision'], $decision, $decisionby));
		}
	}

?>
