window.AppRouter = Backbone.Router.extend({
	init:0,
	currentMain:'dashboard',
	currentModal:'account',

	initialize: function() {
	//	return this.bind('all', this._trackPageview);
	},
	/*_trackPageview: function() {
		var url;
		url = Backbone.history.getFragment();

		return _gaq.push(['_trackPageview',"/" + url]);

	},*/
	routes: {
		'':'listView',

		'account':'account',

		'viewSchedule/:id':'viewSchedule'
	},

	listView: function() {
		Scheduleme.helpers.switchView(Scheduleme.ScheduleListView);
	},
	account: function () {
		console.log('accountView')
	},
	viewSchedule: function(id) {
		if (Scheduleme.meta.d3 && Scheduleme.Schedules.get(id).get('type') == 'shifted') {
			var view = new Scheduleme.classes.views.ScheduleView.d3({model: Scheduleme.Schedules.get(id)});
		} else if (typeof Scheduleme.Schedules.get(id).get('csv') != 'undefined') {
			var view = new Scheduleme.classes.views.ScheduleView.table({model: Scheduleme.Schedules.get(id)});
		} else {
			var view = new Scheduleme.classes.views.ScheduleView.gview({model: Scheduleme.Schedules.get(id)});
		}
		//Note this needs a back button
		Scheduleme.helpers.switchView(view, true);
	}
});