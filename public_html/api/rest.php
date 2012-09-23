<?php

include ("Log.php");

class RestSQL {
    
	var $config;
	var $db;
	var $method = 'GET';
	var $requestData = NULL;
	var $extension = NULL;
	var $table = NULL;

	var $uid = NULL;
	var $components = array();
	var $return = array();

	var $id = NULL;
	var $admin = NULL;
	var $data = NULL; //This will hold json post data
	var $l = NULL;

	/**
	 * A trace of all methods which get hit, which can be returned for debugging
	 */	
	var $trace = array();
    
	/**
	 * Constructor. Parses the configuration file "phprestsql.ini", grabs any request data sent, records the HTTP
	 * request method used and parses the request URL to find out the requested table name and primary key values.
	 * @param str iniFile Configuration file to use
	 */
	function RestSQL($iniFile = '../../Connections/api.ini') {
		session_start();
		$this->config = parse_ini_file($iniFile, TRUE);
		$this->connect(); //Establish database connection
		$v = date("Y-m-d");
		$this->l = &Log::singleton("file","../../logs/$v.log");
		//I should probably escape all data here, as one string, before it is decoded
		$this->data=json_decode(file_get_contents('php://input'), true);

		if (isset($_SESSION['employee_id'])) { //This should not check a retailer session; it should check a provided apiKey
			$this->id=$_SESSION['employee_id'];
			$this->user_type = 'employee';

			$this->authorized = true;
		} else if (isset($_SESSION['employer_id'])) {
			$this->id=$_SESSION['employer_id'];
			$this->user_type = 'employer';
			$this->authorized = true;
		} else if (isset($_GET['sessionOverride'])) {
			$this->id=1;
			$this->user_type = 'employee';
			$this->authorized = true;
		} else {
			$this->authorized = false;
		}
		//$this->userId = 1;
		if (isset($_SERVER['REQUEST_URI']) && isset($_SERVER['REQUEST_METHOD'])) {

			$urlString = substr($_SERVER['REQUEST_URI'], strlen($this->config['settings']['baseURL']));
			//Ignore anything after a '?' (ignore get parameters)
			$temp = explode('?',$urlString);//should split into two parts
			$urlParts = explode('/', $temp[0]);
					
			$lastPart = array_pop($urlParts);
			$dotPosition = strpos($lastPart, '.');
			if ($dotPosition !== FALSE) {
				$this->extension = substr($lastPart, $dotPosition + 1);
				$lastPart = substr($lastPart, 0, $dotPosition);
			}
			array_push($urlParts, $lastPart);
			if (isset($urlParts[0]) && $urlParts[0] == '') {
				array_shift($urlParts);
			}
			$this->components = $urlParts;

			//This is where the URL parts are parsed and saved. For my purposes this will have to be modified extensively.
			if (isset($urlParts[0])) $this->table = $urlParts[0];
			if (count($urlParts) > 1 && $urlParts[1] != '') {
				array_shift($urlParts);
				foreach ($urlParts as $uid) {
					if ($uid != '') {
						$this->uid = $uid;
					}
				}
			}
            
			$this->method = $_SERVER['REQUEST_METHOD'];
            
			if (isset($_GET['method'])) {
				if ($_GET['method']=='put') {
					$this->method = 'PUT';
				} else if ($_GET['method']=='delete') {
					$this->method = 'DELETE';
				}
			}
		}
	}
    
	/**
	 * Connect to the database.
	 */
	function connect() {
  	      
		$database = $this->config['database']['type'];
		require_once($database.'.php');
		$this->db = new $database(); 
		if (isset($this->config['database']['username']) && isset($this->config['database']['password'])) {
			if (!$this->db->connect($this->config['database'])) {
				trigger_error('Could not connect to server', E_USER_ERROR);
			}
		} elseif (isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW'])) {
			$this->config['database']['username'] = $_SERVER['PHP_AUTH_USER'];
			$this->config['database']['password'] = $_SERVER['PHP_AUTH_PW'];
			if (!$this->db->connect($this->config['database'])) {
				$this->criticalFailure();
			}
		} else {
			$this->criticalFailure();
		}
	}
    
	/**
	 * Execute the request.
	 */
	function exec() {
		
		if ($this->authorized) {
			switch ($this->table) {
				case 'employees':
					$this->employees();
					break;
				case 'employers':
					$this->employers();
					break;
				case 'shifts':
					$this->shifts();
					break;
				case 'schedules':
					$this->schedules();
					break;
				case 'requests':
					$this->requests();
					break;
			}
		} else {
			$this->unauthorized();
		}
		if (isset($_GET['sendTrace'])){
			$this->return['trace']=$this->trace; //Return the trace; for debugging only
		}
		$this->return['time']=time();

		$s = array();
		$s['IPAddress']=$_SERVER['REMOTE_ADDR'];
		$s['Method']=$this->method;
		$s['URL']=$_SERVER['REQUEST_URI'];
		if (isset($this->id)) {
			$s['Retailer']=$this->id;
			if (isset($this->uid)) {
				$s['Uid']=$this->uid;
			}
			$s['Response']=$this->returnCode;
			if ($this->table == 'check') {
				$s['Registered']=$this->return['registered'];
			}
		} else {
			$s['Authorized']=false;
		}
		$this->l->log(json_encode($s),PEAR_LOG_INFO); //I think [info] level is default anyways

		header('Content-Type: application/json');
		if ($this->returnCode == 200) {
			header('Status: 200 OK');
		} else if ($this->returnCode == 201) {
			header('Status: 201 Created');
		} else if ($this->returnCode == 400) {
			header('Status: 400 Bad Request');
		} else if ($this->returnCode == 401) {
			header('Status: 401 Unauthorized');
		} else if ($this->returnCode == 404) {
			header('Status: 404 Resource Does Not Exist');
		} else if ($this->returnCode == 500) {
			header('Status: 500 Internal Server Error');
		} else if ($this->returnCode == 501) {
			header('Status: 501 Not Implemented');
		}
		header('Content-Type: application/json');
		echo json_encode($this->return);   
		$this->db->close();
	}
	
	function employees () {
		$this->trace[]='employees';
		switch ($this->method) {
			case 'GET':
				$this->getEmployees();
				break;
			case 'POST':
				$this->addEmployee();
				break;
			case 'PUT':
				if (isset($this->component[2])) {
					if ($this->component[2] == 'passSet') {
						$this->updateEmployeePassSet($this->component[1]);
					}
				} else if (isset($this->component[1])) {
					$this->updateEmployee($this->component[1]);
				} else {
					$this->unavailable();
				}
				break;
			case 'DELETE':
				if (isset($this->uid)) {
					$this->removeEmployee();
				} else {
					$this->unavailable();
				}
				break;
		}
	}
	function employers () {
		$this->trace[]='employers';
		switch ($this->method) {
			case 'GET':
				$this->getEmployer();
				break;
			case 'POST':
				$this->addEmployer();
				break;
			case 'PUT':
				if (isset($this->component[1])) {
					$this->updateEmployer($this->component[1]);
				} else {
					$this->unavailable();
				}
				break;
			case 'DELETE':
				if (isset($this->uid)) {
					$this->unavailable();
				} else {
					$this->unavailable();
				}
				break;
		}
	}
	function shifts () {
		$this->trace[]='shifts';
		switch ($this->method) {
			case 'GET':
				if (isset($this->component[1])) {
					$this->getShift($shift);
				} else {
					$this->unavailable();
				}
				break;
			case 'POST':
				$this->addShift();
				break;
			case 'PUT':
				if (isset($this->component[1])) {
					$this->updateShift($this->component[1]);
				} else {
					$this->unavailable();
				}
				break;
			case 'DELETE':
				if (isset($this->component[1])) {
					$this->removeShift($this->component[1]);
				} else {
					$this->unavailable();
				}
				break;
		}
	}
	function schedules() {
		$this->trace[]='schedules';
		switch ($this->method) {
			case 'GET':
				if (isset($_GET['date'])) {
					$this->getSchedule($this->db->escape($_GET['date']));
				} else {
					$this->getSchedules();
				}
				break;
			case 'POST':
				$this->addSchedule();
				break;
			case 'PUT':
				$this->unavailable();
				break;
			case 'DELETE':
				$this->unavailable();
				break;
		}
	}
	function upforgrabs() {
		$this->trace[]='upforgrabs';
		switch ($this->method) {
			case 'GET':
				$this->getGrabs();
				break;
			case 'POST':
				if (isset($this->components[1]) && $this->components[1] == 'take') {
					if (isset($this->uid)) {
						$this->requestShift();
					} else {
						$this->doesNotExist('No resource specified');
					}
				} else {
					$this->addGrab();
				}
				break;
			case 'PUT':
				$this->updateMessage();
				break;
			case 'DELETE':
				$this->removeGrab();
				break;
		}
	}
	function request () {
		$this->trace[]='changes';
		switch ($this->method) {
			case 'GET':
				$this->getRequests();
				break;
			case 'POST':
				$this->addRequest();
				break;
			case 'PUT':
				if (isset($this->uid)) {
					$this->respondRequest();
				} else {
					$this->unavailable();
				}
				break;
			case 'DELETE':
				if (isset($this->uid)) {
					$this->removeRequest();
				} else {
					$this->unavailable();
				}
				break;
		}
	}
//-----------------------------------------EMPLOYEES-----------------------------------------
	function getEmployees(){
		if ($this->user_type == 'employer') {
			$query="SELECT * FROM employees WHERE employer_id='$this->id'";
			$response=$this->db->query($query);
		}
	$this->success();
	}
	function addEmployee(){
		if ($this->user_type == 'employer') {
			$name=$this->db->escape($this->data['name']);
			$enumber=$this->db->escape($this->data['enumber']);
			$password=$this->db->escape($this->data['password']);
			$query="INSERT INTO employees (employer_id,name,enumber) VALUES ($this->id,$name,$enumber)";
		}
	$this->success();
	}
	function updateEmployee($employee){

		//New values
		$name = $this->db->escape($this->data['name']);
		$enumber = $this->db->escape($this->data['']);
		$email = $this->db->escape($this->data['email']);
		$phone = $this->db->escape($this->data['phone']);
		$password = $this->db->escape($this->data['password']);

		if ($this->user_type == 'employer') {

		} else if ($this->user_type == 'employee') {
			
		}
		$this->success();
	}
	function updateEmployeePassSet($employee) {
		if ($this->user_type == 'employee') {
			$query = "UPDATE employees SET emp_pass_set=1 WHERE employee_id='$this->id'";
		}
	}
	function removeEmployee($employee){
		if ($this->user_type == 'employer') {
			
		}
	$this->success();
	}
//-----------------------------------------EMPLOYERS-----------------------------------------
	function getEmployer(){
		$this->unavailable();
	}
	function addEmployer(){
		$this->unavailable();
	}
	function updateEmployer($employer){
		if ($this->user_type == 'employer') {

		}
	$this->success();
	}
//-----------------------------------------SCHEDULES-----------------------------------------
	function getSchedule ($date) {
		$this->trace[]='getSchedule';
		try {
			$query = "SELECT `shift_id`, `employer_id`, `date`, `start_time`, `end_time`, `position`, `employee_id` FROM `shifts` WHERE date=DATE('$date') and employer_id='$this->id' ORDER BY date,start_time ASC";
			$resource=$this->db->query($query);
			if (!$resource) {
				throw new Exception ('Query failure in getSchedule');
			}
			$return=array();
			while ($row=$this->db->row($resource)) {
				$return[]=$row;
			}
			$this->return['data']=$return;
		} catch (Exception $e) {
			$this->criticalFailure($e->getMessage());
		}
	}
	function getSchedules () {
		//Return future schedules
		$this->trace[]='getSchedules';
		if ($this->user_type == 'employer') {
			try {
				$query = "SELECT `shift_id`, `employer_id`, `date`, `start_time`, `end_time`, `position`, `employee_id` FROM `shifts` WHERE date>=DATE(NOW()) and employer_id='$this->id' ORDER BY date,start_time ASC";
				$resource=$this->db->query($query);
				if (!$resource) {
					throw new Exception ('Query failure in getSchedule');
				}
				$return=array();
				while ($row=$this->db->row($resource)) {
					$return[]=$row;
				}
				$this->return['data']=$return;
			} catch (Exception $e) {
				$this->criticalFailure($e->getMessage());
			}
		} else if ($this->user_type == 'employee') {

		}
	}
//-------------------------------------------SHIFTS------------------------------------------
	function getShifts(){
		/*Return shift information
				- start_time
				- end_time
				- position
				- overlapping {	(shifts working at the same time)
						- start_time(min of shift start_time
						- end_time(max of shift end_time)
						- employee name
						- position
					}
		*/
	}
	function addShift($shift){
		if ($this->user_type == 'employer') {
			$date=$this->db->escape($this->data['date']);
			$start_time=$this->db->escape($this->data['start_time']);
			$end_time=$this->db->escape($this->data['end_time']);
			$position=$this->db->escape($this->data['position']);
			$employee_id=$this->db->escape($this->data['employee_id']);

			$query="INSERT INTO shifts (employer_id,date,start_time,end_time,position,employee_id) VALUES ('$shift','$date','$start_time','$end_time','$position','$employee_id')";
			if ($response = $this->db->query($query)) {
				$this->success();
			} else {
				$this->criticalFailure('Could not add shift');
			}
		} else {
			$this->unauthorized();
		}
	}
	function updateShift($shift){
		if ($this->user_type == 'employer') {
			$update='';

			if (isset($this->data['start_time'])) {
				$start_time=$this->db->escape($this->data['start_time']);
				$update.="start_time='$start_time',";
			}
			if (isset($this->data['end_time'])) {
				$end=$this->db->escape($this->data['end_time']);
				$columns.="end_time='$end_time',";
			}
			if (isset($this->data['position'])) {
				$position=$this->db->escape($this->data['position']);
				$columns.="position='$position',";
			}
		
			$update=substr($columns,0,-1); //Remove last comma

			$query="UPDATE shifts SET $columns WHERE shiftid='$this->uid' AND employer_id='$this->id'";
			if ($response=$this->db->query($query)) {
				$this->success();
			} else {
				$this->criticalFailure('Could not update shift');				
			}
		} else {
			$this->unauthorized();
		}
	}
	function removeShift($shift){
		if ($this->user_type == 'employer') {
			$query="DELETE FROM shifts WHERE shift_id='$this->uid'";
			if ($this->db->query($query)) {
				$this->success();
			} else {
				$this->criticalFailure('Could not remove shift');
			}
		} else {
			$this->unauthorized();
		}
	}
//------------------------------------------CHANGES------------------------------------------
	/*
	 * Fetch open requests (should only be from current time onwards)
	 */
	function getRequests(){
		if ($this->user_type == 'employers') {

		}
	$this->success();
	}
	function addRequest(){
		//An employee has posted 
		if ($this->user_type == 'employee') {
			
		}
	$this->success();
	}
	/*
	 * Approve or deny a request change
	 */	
	function respondRequest(){
		if ($this->user_type == 'employer') {
			try {
				if (isset($this->uid)) {
					if ( (isset($_GET['response']) && ( $_GET['response']=='approved' || $_GET['response']=='denied' )) &&
								isset($_GET['approver']) ) {
						$answer=$this->db->escape($this->data['response']);
						$approver=$this->db->escape($this->data['approver']);
						$message=$this->db->escape($this->data['message']);
						$query="UPDATE change_request SET decision='$answer', decision_time=NOW(), decision_by='$approver', message='$message' WHERE change_id='$this->uid' LIMIT 1";
						if (!$response=$this->db->query($query)) {
							throw new Exception('Query1 failure in respondRequest');
						}
						$query="SELECT shift_id, from_employee, to_employee FROM change_request as cr JOIN shifts as s USING (shift_id) WHERE employer_id='$this->id' AND change_id='$this->uid' LIMIT 1";
						if (!$response=$this->db->query($query)) {
							throw new Exception('Query failure in respondRequest');
						}
						$row=$this->db->row($response);
						$shiftid=$row['shift_id'];
						$fromemp=$row['from_employee'];
						$toemp=$row['to_employee'];
						//Remove grab post if response was approved
						if ($answer == 'approved') {
							$rpostquery="UPDATE upforgrabs SET filled=1 WHERE shift_id='$shiftid'";
							if (!$rpostresponse=$this->db->query($rpostquery)) {
								throw new Exception('Query failure in respondRequest');
							}
							//Deny outstanding requests for the same shift; notify to_employees
							$query="SELECT to_employee FROM change_requests WHERE shift_id='$shiftid' AND change_id != '$this->uid' AND decision is NULL";
							if (!$response=$this->db->query($query)) {
								throw new Exception ('Query failure notifying denied others');
							}
							//Update in the database
							$queryUpdate="UPDATE change_requests SET decision='denied', decision_time=NOW(), decision_by='',message='Shift no longer available' WHERE shift_id='$shiftid' AND change_id != '$this->uid'";
							if (!$responseUpdate=$this->db->query($queryUpdate)) {
								throw new Exception ('Query failure denying other requests for shift');
							}

							//Fetch each denied employee and notify them
							while ($row=$this->db->row($response)) {
								$this->notifyEmployee($row['to_employee'],$shiftid,'denied','Shift no longer available');
							}
						}
						//TODO: Notify both employees 
						
			
						$this->success();
				
					} else {
						$this->incorrectParameters('Invalid parameters provided');
					}
				} else {
					$this->doesNotExist('No resource identified');
				}
			} catch (Exception $e) {
				
			}
		}
	}
	function removeRequest(){
		$this->unavailable();
	}
//-------------------------------------------GRABS-------------------------------------------
	/*
	 * Fetch all grabs for the employer
	 */
	function getGrabs(){
		if ($this->user_type == 'employer'){
		} else if ($this->user_type == 'employee'){
		}
	$this->success();
	}
	/*
	 * Put a shift up for grabs
	 */
	function addGrab(){
		if ($this->user_type == 'employee'){
			if (isset($this->data['shift_id'])) {	
				$shift=$this->db->escape($this->data['shift_id']);
				//Check that the shift belongs to the current employee
				//Insert the grab
			} else {
				$this->incorrectParameters('No shift specified');
			}
		}
	$this->success();
	}
	/*
	 * Submit a request to take a shift (Note there is another method does does this as well, addRequest())
	 */
	function requestShift(){
		if ($this->user_type == 'employee'){
			//Check that the current employee has no conflicts
			//Insert a request
		}
	$this->success();
	}
	/*
	 * Update the message associated with the post
	 */
	function updateMessage(){
		if ($this->user_type == 'employee'){
			if (isset($this->data['message'])) {

			} else {
				$this->incorrectParameters('No new message provided');
			}
		}
	$this->success();
	}
	/*
	 * Remove the Grab
	 */
	function removeGrab(){
		if ($this->user_type == 'employer'){
			//Employer removing grab;ie they are not allowed to give it away
			//Check that the shift is with the employer
			//Remove the grab. Notify the employeee why it was removed/popup message telling employer to notify them
		} else if ($this->user_type == 'employee'){
			//Check that the shift belongs to the current employee
				//Delete the grab
		}
	$this->success();
	}
//-------------------------------------HELPER FUNCTIONS--------------------------------------
	/*
	 * Used to notify an employee, whether this be by text message, push notification, etc.
	 */
	function notifyEmployee($eid,$sid,$decision,$message) {
		$example_body="SHIFT REQUEST UPDATE: Request for shift change on {date} from {start_time} to {end_time} has been $decision";
		if (isset($message)) {
			$example_body.= " with the following message: '$message'.";
		} else {
			$example_body.='.';
		}
	}
	function success ($a = null) {
		$this->returnCode=200;
		$this->return['success']=true;
		if (isset($a)){
			$this->return['message']=$a;
		}
	} function incorrectParameters ($a = 'Some parameters are incorrect') {
		$this->return['success']=false;
		$this->returnCode=400;
		$this->return['message']=$a;
	} function unauthorized ($a = 'The provided credentials do not have this permission') {
		$this->return['authorized']=false;
		$this->returnCode=401;
		$this->return['message']=$a;
	} function doesNotExist($a = 'The requested resource does not exist') {
		$this->return['authorized']=false;
		$this->returnCode=404;
		$this->return['message']=$a;
	} function failure ($a = 'We seem to be having technical difficulties') {
		$this->return['success']=false;
		$this->return['message']=$a;
	} function criticalFailure ($a = 'Could not connect to database') {
		$this->l->log($a,PEAR_LOG_CRIT);
		$this->returnCode=500;
		$this->failure();
	}	function unavailable () {
		$this->return['availability']=false;
		$this->returnCode=501;
		$this->return['message']='The requested option is not available through the API';
	} function message($a) {
		$this->return['message']=$a;
	}

}

?>
