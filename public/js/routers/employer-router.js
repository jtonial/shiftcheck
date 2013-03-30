window.AppRouter = Backbone.Router.extend({
	//Note: I'm currently using tabs; another approach would be to make each tab
		//it's own view, and delete/render tabs instead of hiding/showing
		//Seperate views is probably a better approach for scalability;
		// being able to undelegate events when they're not needed
	init:0,

	initialize: function() {
		return this.bind('all', this._trackPageview);
	},
	_trackPageview: function() {
		var url;
		url = Backbone.history.getFragment();
		//alert('tracking...: '+url);
	//	if (this.currentMain != url ) {
			return _gaq.push(['_trackPageview',"/employer/" + url]);
	//	}
	},
	routes: {
		'account':'account',
		'schedule/:id': 'schedule',
		'':'schedules'
	},

	switchView: function (view) {
		if (typeof Scheduleme.CurrentView.viewType !='undefined') {
			Scheduleme.CurrentView.undelegateEvents();
		}
		Scheduleme.CurrentView = view;
		Scheduleme.CurrentView.delegateEvents();
		Scheduleme.CurrentView.render();
	},

	schedule: function (id) {
		console.log('Should be displaying schedule for id: '+id);

		var model = Scheduleme.Schedules.get(id);

		if (model) {
			// Set the title
			$('#content-view-title').html(model.get('datestring'));
			// Create and render view
			Scheduleme.CurrentView = new Scheduleme.classes.views.ScheduleView({ model: model });
			console.log('Created Schedule view');
		} else {
			console.log('ID passed does not seem to match a schedule');
		}
	},
	schedules: function () {
		/*$('.link, .page').removeClass('active');
		$('.schedules').addClass('active');*/

		// Remove .active from all schedule links

		// Remove any schedule views and display a 'Select A Schedule' default view

		console.log('not doing anything right now');
		//console.log('Opening SchedulesView')
		//this.switchView(Scheduleme.SchedulesView);
	},
	account: function () {
		//console.log('Opening AccountView');
		console.log('not doing anything right now');
		//this.switchView(Scheduleme.AccountView);
	}
});