Scheduleme.classes.views.ScheduleView = Backbone.View.extend({
	//This renders directly into the el element; no need to append
		//Replaces everything in it; and no need to postRender()
	el: $('#sidebar-content'),

	template: Handlebars.compile($('#schedule-list-template').html()),

	initialize: function () {

		console.log('Schedule View Initialized');

		this.render();
	},

	render: function () {

		var requiresPostRender = false;

		var schedule = this.model;

		if ( typeof schedule.get('g_spreadsheet_key') != 'undefined' && schedule.get('g_spreadsheet_key') ) {
			var view = new Scheduleme.classes.views.ScheduleView.spreadsheet ({ model: this.model });
		} else if ( typeof schedule.get('json') != 'undefined' && schedule.get('json') ) {
			var view = new Scheduleme.classes.views.ScheduleView.table ({ model: this.model });
		} else if (schedule.get('type') == 'shifted' && Scheduleme.meta.d3) {
			requiresPostRender = true;
			var view = new Scheduleme.classes.views.ScheduleView.d3 ({ model: this.model });
		} else if (schedule.get('type') == 'month') {
			var view = new Scheduleme.classes.views.ScheduleView.pdf ({ model: this.model });
		} else if (schedule.get('type') == 'week') {
			var view = new Scheduleme.classes.views.ScheduleView.pdf ({ model: this.model });
		} else if (schedule.get('type') == 'twoweek') {
			var view = new Scheduleme.classes.views.ScheduleView.pdf ({ model: this.model });
		} else { //Defaults to daily schedule
			var view = new Scheduleme.classes.views.ScheduleView.pdf ({ model: this.model });
		}

		/*view.render();
		view.requiresPostRender = requiresPostRender;

		return view;*/

		view.render();

		if (requiresPostRender) {
			view.postRender();
		}

		return $(view.el);
		
	}

});