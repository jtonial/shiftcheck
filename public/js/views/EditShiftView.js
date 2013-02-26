Scheduleme.classes.views.SchedulesView = Backbone.View.extend({
	//This renders directly into the el element; no need to append
		//Replaces everything in it; and no need to postRender()
	el: $('#edit-area'),


	template: Handlebars.compile($('#edit-shift-template').html()),

	initialize: function () {
		this.viewType = 'schedules';
		//Callback incase I forget to pass reference to collection
		this.collection = typeof this.collection != 'undefined' ? this.collection : Scheduleme.Schedules;

		this.collection.bind('add',this.addOneSchedule, this);
	},

	events: {
		"change #sched-date" : "loadByDate",
		"click .upload-modal-trigger" : "openUploadModel",

		"click #upload_submit" : "createUploadObject"
	},
	render: function () {
		//The JSON passed in does nothing right now, but may in the future
		$(this.el).html(this.template(JSON.stringify(Scheduleme.data)));
		this.postRender();

		return $(this.el);
	},
	postRender: function () {
		$('#sched-date').datepicker({
			showOtherMonths: true,
			dateFormat: 'yy-mm-dd',
			maxDate: "+0D"
		});
		$('#upload-schedule-date').datepicker({
			showOtherMonths: true,
			dateFormat: 'yy-mm-dd',
			minDate: "+0D"
		});

		this.addAllSchedules();
		//Select first schedule
		$('#dates.nav.nav-tabs li:nth-child(2) a').click();
	},
	openUploadModel: function () {
		$('#upload-modal').modal('show');
	},

	createUploadObject: function ( event ) {

		event.preventDefault();
		$('.modal-footer button').attr('disabled', true);
		$('#ajax-loader').removeClass('hidden');
		//This works (delegating the task to the helper object)
		obj = new uploadObject();
		obj.setCallback(function () {
			$('.modal-footer button').attr('disabled', false);
			$('#ajax-loader').addClass('hidden');
		});
		obj.requestCredentials();
	}
});