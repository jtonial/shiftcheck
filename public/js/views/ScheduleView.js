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

		if (schedule.get('type') == 'month') {
			var view = new Scheduleme.classes.views.ScheduleView.monthly ({ model: this.model });
		} else if (schedule.get('type') == 'week') {
			var view = new Scheduleme.classes.views.ScheduleView.weekly ({ model: this.model });
		} else if (schedule.get('type') == 'twoweek') {
			var view = new Scheduleme.classes.views.ScheduleView.biweekly ({ model: this.model });
		} else if (schedule.get('type') == 'shifted' && Scheduleme.meta.d3) {
			requiresPostRender = true;
			var view = new Scheduleme.classes.views.ScheduleView.d3 ({ model: this.model });
		} else if (typeof schedule.get('json') != 'undefined' && schedule.get('json') != null ) {
			var view = new Scheduleme.classes.views.ScheduleView.table ({ model: this.model });
		} else { //Defaults to daily schedule
			var view = new Scheduleme.classes.views.ScheduleView.daily ({ model: this.model });
		}

		view.render();

		if (requiresPostRender) {
			view.postRender();
		}

		return $(this.el);
		
	}

});