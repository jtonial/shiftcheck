$(function () {
	$('#login-form').submit(function (e) {
		console.log('test');
		e.preventDefault(); //Prevent default submission
		console.log($(this).serialize());

		$.ajax({
			url: window.location.pathname,
			type: 'POST',
			data: $(this).serialize(),
			success: function (response) {
				window.location.href='/';
			}, error: function (response) {
				alert ('Username and password do not match. Please try again');
			}
		});	
	})
});
