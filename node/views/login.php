<?php

include("../Connections/mysql_connect_php.php");
include ("Log.php");

require('helperfunctions.php');

session_start();

$redirTo='/';
$email=mysql_real_escape_string($_POST['email']);

if (!isset($_SESSION['userid'])) {
	if (isset($_POST['email'])){
		$query="SELECT employee_id,password FROM employees WHERE email='".$email."' LIMIT 1";
		//$query="SELECT *, TIME_TO_SEC(TIMEDIFF(NOW(), `lastattempt_date`)) as timediff FROM nrmitchi_php.users WHERE email='testnrmitchi@hotmail.com' LIMIT 1";
		//$_POST['password'] = $_GET['password']; //Used for testing
		//echo "<br/><br/>".$query;
		$return=mysql_query($query,$dbphp);
		$accountLockAmount = 5;
	
		$fieldEmail = "";

		$v = date("Y-m-d");
		$l = &Log::singleton("file","../logs/$v.log");
		$s = array();
	
		$s['Type']='Employee Login';
		$s['Employee'] = NULL;
		//$s['User']=$_POST['email'];
		$s['Success']=false;

		if ($return && mysql_num_rows($return)){
			$fieldEmail=$email;//Used to prepopulate email field in form only if email exists
			$row=mysql_fetch_array($return, MYSQL_ASSOC);
			$s['User']=$row['userid'];
			if ($_POST['password'] != NULL) {
				if (myhash($_POST['password']) == $row['password']) {
					//Signin validated.
					//Update signings, last logon_date, set failed_attempts to 0 in database
					//$query="UPDATE users SET last_login=NOW(), login_count=login_count+1 WHERE userid=".$row['userid']." LIMIT 1";//Update tracking info when columns are added in db

					//$return=mysql_query($query,$dbphp); 
				
					//Create/update cookie data
					setcookie('email', mysql_real_escape_string($_POST['email']), time()+2592000, '/', '.nrmitchi.ca'); //Sets the users email in a cookie. This will be used to populate email field on future visits
					//Create session
	
					$_SESSION['employee_id']=$row['employee_id'];
					$_SESSION['expireTime']=time()+60*30;//Sets the session to expire in 30 minutes.
					$_SESSION['IPADDRESS']=$_SERVER['REMOTE_ADDR'];

					$s['Success']=true;

					//Redirect to the home page.
					header('Location: '.$redirTo); //Redirect user back to previous page
				}
			}
		} else {
			$s['query'] = $query;
			$s['User']='Email Not Registered';
		}

		//Log activity
		$l->log(json_encode($s),PEAR_LOG_INFO);
	}
} else {
	header ('Location: '.$redirTo); 
}
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Schedule.me</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="nrmitchi">

 
    <link href="./css/bootstrap.css" rel="stylesheet">
    <script src="http://heapify.ca/js/jquery/jquery-1.7.2.min.js"></script>
    <script src="./js/bootstrap.js"></script>

    <style>
      .navbar-static-top {
        margin-bottom:20px;
      }
    </style>

  </head>

  <body>

    <div class="navbar navbar-static-top">
      <div class="navbar-inner">
        <div class="container">
					<a href="/" class="brand">schedule.me</a>

          <ul class="nav pull-right">
            <li><a href="admin-login.php">Admin Login</a></li>
            <li class="active"><a href="login.php">Login</a></li>
          </ul>

        </div>
      </div>
    </div>

    <div class="container">

      <div class="wrapper" style="width:500px;margin:0 auto;">
      <div class="well">
        <h1>Login</h1>
        <form action="" method="POST" class="form-horizontal">
          <fieldset>
            <div class="control-group">
              <label class="control-label" for="input01">Email: </label>
              <div class="controls">
                <input type="text" class="input-xlarge" name="email" id="email" <?php if(isset($_POST['email'])) { echo 'value="'.$email.'"'; } ?>>
              </div>
            </div>
            <div class="control-group">
              <label class="control-label" for="input01">Password: </label>
              <div class="controls">
                <input type="password" class="input-xlarge" name="password" id="password">
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary input-xlarge">Login</button>
            </div>
          </fieldset>
        </form>
      </div>
      </div>
    </div> <!-- /container -->

  </body>
</html>
