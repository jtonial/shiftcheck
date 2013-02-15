Scheduleme.classes.views.ScheduleView.biweekly = Backbone.View.extend({
	
	template: Handlebars.compile($('#schedule-template').html()),
	
	className: 'tab-pane',

	//Create the frame
	initialize: function () {

	},
	render: function () {
		$(this.el).attr('id','d'+this.model.get('datenum'));
		$(this.el).html(this.template(this.model.toJSON()));
		return $(this.el);
	}
});