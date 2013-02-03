$(function () {
	$('#add-employee-form').submit(function (e) {
		e.preventDefault(); //Prevent default submission
		var that = $(this);
		$.ajax({
			url: '/me/employee',
			type: 'POST',
			data: $(this).serialize(),
			success: function (response) {
				alert('Employee created!')
				that.find("input[type=text], input[type=password], textarea").val("");
			}, error: function (response) {
				alert ('something went wrong!');
			}
		});	
	})
});
