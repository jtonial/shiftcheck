<?

session_start();
//Log signout
session_destroy();

header('Location: /');

?>
