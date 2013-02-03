$(function () {
	$('#signup-form').submit(function (e) {
		e.preventDefault(); //Prevent default submission

		$.ajax({
			url: '/signup',
			type: 'POST',
			data: $(this).serialize(),
			success: function (response) {
				window.location.href='/';
			}, error: function (response) {
				alert ('something went wrong!');
			}
		});	
	})
});
