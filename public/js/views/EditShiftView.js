Scheduleme.classes.views.SchedulesView = Backbone.View.extend({
	//This renders directly into the el element; no need to append
		//Replaces everything in it; and no need to postRender()
	el: $('#edit-area'),


	template: Handlebars.compile($('#edit-shift-template').html()),

	events: {
		"change #sched-date" : "loadByDate",
		"click .upload-modal-trigger" : "openUploadModel"
	},
	render: function () {
		//The JSON passed in does nothing right now, but may in the future
		$(this.el).html(this.template(JSON.stringify(Scheduleme.data)));
		this.postRender();

		return $(this.el);
	}
});