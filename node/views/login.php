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
