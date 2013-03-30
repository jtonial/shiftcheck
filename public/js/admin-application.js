//$(function() { //This can be added back in when I use require.js, or soemthing to manage the includes

	window.Scheduleme = {//new Object();
		classes: {
			models: {},
			collections: {},
			views: {
				ScheduleView: {},
			},
		},
		helpers: {},

		data: {},

		Schedules: {},

		Init: function () {},

		CurrentView: {},
		Router: {},

		meta: {
			state: 'admin',
			mobile: false,
			d3: true
		}
	};

	Scheduleme.helpers.addMinutes = function(date, adding) {
		return new Date(date.getTime() + minutes*60000);
	};
	Scheduleme.helpers.UTCify = function (date) {
		return new Date(date.getTime() + date.getTimezoneOffset()*60000);
	};
	Scheduleme.helpers.fromUTC = function (date) {
		return new Date(date.getTime() - date.getTimezoneOffset()*60000);
	};
	Scheduleme.helpers.addDays = function(date, adding) {
		var nd = new Date();
		nd.setDate(date.getDate() + adding);
		return nd;
	};

	//-------------------------------ROUTER------------------------------------
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

		schedules: function () {
			/*$('.link, .page').removeClass('active');
			$('.schedules').addClass('active');*/
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
//------------------PAYLOAD----------------------------

	Scheduleme.Init = function () {
		Scheduleme.Schedules = new Scheduleme.classes.collections.Schedules();

		//Router takes care of this
		//Scheduleme.SchedulesView = new Scheduleme.classes.views.SchedulesView({ collection: Scheduleme.Schedules });
		Scheduleme.AccountView = new Scheduleme.classes.views.AccountView();

		Scheduleme.ScheduleListView = new Scheduleme.classes.views.ScheduleListView({ collection: Scheduleme.Schedules });

		Scheduleme.Router = new AppRouter;
		//Note: I'm not using pushState right now because I dont want to have to deal with making the server-side be
			//able to handle it.
		Backbone.history.start({
			//pushState: true,
			//root: '/'
		});
		//configPushState();

		//AJAX Setup
		$.ajaxSetup({
			dataType: 'json' //AJAX responses will all be treated as json dispite content-type
		});
		//Add global $.ajaxError handlers

		$.ajax({
			url: '/bootstrap',
			success: function (res) {
				//Removing loading div
				if (!res.data.schedules.length) {
					$('#schedule-content').html('You current have no schedules in the system');
				}
				$.each(res.data.schedules, function () {
					Scheduleme.Schedules.add(this);
				});
				//I should only have to do this once, as any other schedule add (if even possible) will be in order (I hope)
				//Other option is to reRenderTabs() at the end of addOneSchedule
				if (Scheduleme.CurrentView.viewType == 'schedules') {
					Scheduleme.CurrentView.reRenderTabs();
					$('#dates.nav.nav-tabs li:nth-child(2) a').click();
				}

				//Add data into global object
				Scheduleme.data.email = res.data.email;
				if (Scheduleme.CurrentView.viewType !='undefined') {
					$('#email').val(Scheduleme.data.email);
				}
				Scheduleme.data.name = res.data.name;
				Scheduleme.data.username = res.data.username;
			}, error: function () {
				//Remove loading div
				console.log('An error occured');
				alert('We seem to be having some technical difficulties');
			}
		});
	};

	$(document).ready(function () {
		Scheduleme.Init();
	});

//});