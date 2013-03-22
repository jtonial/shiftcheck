Scheduleme.classes.views.ScheduleView.table = Backbone.View.extend({
	
	template: Handlebars.compile($('#schedule-template-table').html()),
	
	className: 'tab-pane',

	//Create the frame
	initialize: function () {
		if (Scheduleme.meta.mobile) {
			this.el = $('#content');
		}
	},

	//Add in views for each shift in the schedule
	render: function () {
		$(this.el).attr('id','d'+this.model.get('datenum'));
		$(this.el).html(this.template(this.model.toJSON()));

		this.$('.scheduleFrame').remove(); //Remove iFrame  //If this is used iFrame will be removed from template and wont be necessary

		return $(this.el);
	}
});