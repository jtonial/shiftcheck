window.Scheduleme = window.Scheduleme || {//new Object();
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

	User: {},

	meta: {
		state: 'admin',
		ADMIN: 1,
		mobile: true,
		d3: true
	}
};

//$(function() {

	Scheduleme.helpers.addMinutes = function(date, adding) {
		return new Date(date.getTime() + minutes*60000);
	};
	Scheduleme.helpers.UTCify = function (date) {
		return new Date(date.getTime() + date.getTimezoneOffset()*60000);
	};
	Scheduleme.helpers.fromUTC = function (date) {
		return new Date(date.getTime() + date.getTimezoneOffset()*60000);
	};
	Scheduleme.helpers.addDays = function(date, adding) {
		var nd = new Date();
		nd.setDate(date.getDate() + adding);
		return nd;
	};
	Scheduleme.helpers.switchView = function (view, postRender) {
		if (typeof Scheduleme.CurrentView.viewType !='undefined') {
			Scheduleme.CurrentView.undelegateEvents();
		}
		Scheduleme.CurrentView = view;
		Scheduleme.CurrentView.delegateEvents();
		Scheduleme.CurrentView.render();

		if (postRender) {
			Scheduleme.CurrentView.postRender();
		}
	};
	Scheduleme.helpers.titleDate = function(datenum, datestring) {
		var t = new Date();
		var today = t.getFullYear()+'-'+(t.getMonth()+1)+'-'+(t.getDate()+1);
		var output = '';
		if (datenum == today) {
			return 'Today';
		} else {
			return datestring;
		}
	}
	/*Scheduleme.helpers.viewSchedule = function (id) {
		console.log(typeof Scheduleme.Schedules.get(id).get('csv') != 'undefined');
		if (Scheduleme.meta.d3 && Scheduleme.Schedules.get(id).get('type') == 'shifted') {
			var view = new Scheduleme.classes.views.ScheduleView.d3({model: Scheduleme.Schedules.get(id)});
		} else if (typeof Scheduleme.Schedules.get(id).get('csv') != 'undefined') {
			console.log('here');
			var view = new Scheduleme.classes.views.ScheduleView.table({model: Scheduleme.Schedules.get(id)});
		} else {
			var view = new Scheduleme.classes.views.ScheduleView.gview({model: Scheduleme.Schedules.get(id)});
		}
		//Note this needs a back button
		Scheduleme.helpers.switchView(view);
	};*/
	Scheduleme.helpers.fetchBootstrap = function () {
		$.ajax({
			url: 'http://staging-shift-check.herokuapp.com/bootstrap',
			success: function (res) {

				window.Scheduleme.User = {
					loggedIn : true
				}

				// Switch the active page to list view
				//window.location.hash = 'schedule-page';
				$.mobile.changePage( '#list-page', {
					transition: "fade",
					reverse: false
				});
				// Scheduleme.helpers.switchView(Scheduleme.ScheduleListView);

				//Removing loading div
				$.each(res.data.schedules, function () {
					Scheduleme.Schedules.add(this);
				});
				//I should only have to do this once, as any other schedule add (if even possible) will be in order (I hope)
				//Other option is to reRenderTabs() at the end of addOneSchedule

				Scheduleme.ScheduleListView.reRenderTabs();
				Scheduleme.ScheduleListPanelView.reRenderTabs();

				//Add data into global object
				Scheduleme.data.email = res.data.email;
				Scheduleme.data.name = res.data.name;
				Scheduleme.data.username = res.data.username;

				alert('bootstrap success');

			}, error: function (xhr, status, text) {
				//Remove loading div
				if (xhr.status == '403') {
					//Scheduleme.helpers.switchView(Scheduleme.LoginView);
					$.mobile.changePage( '#login-page', {
						transition: "fade",
						reverse: false
					});
				} else  {
					console.log('An error occured: '+xhr.status);
					alert('We seem to be having some technical difficulties: '+xhr.status);
				}
			}
		});
		$.ajax({
			url: '/positions',
			type: 'GET',
			success: function (res) {
				Scheduleme.data.positions = res.data.positions;
			}
		})
	};
	Scheduleme.helpers.handleLogout = function () {
		//Destory session;
		$.ajax({
			url: '/logout',
			type: 'GET',
			error: function () {
				console.log('wtf cannot log out');
			},
			success: function () {
				
			},
			complete: function () {
				Scheduleme.helpers.switchView(Scheduleme.LoginView);
				//Destroy data;
			}
		})
	};

	//Used for global events
	Scheduleme.classes.views.AppView = Backbone.View.extend({
		el: $('body'),

		template: Handlebars.compile($('#app-template').html()),

		events: {
			'click .back-to-list' 		: 'back',
			'click .account-trigger' 	: 'openAccountView',
			'click .logout-trigger' 	: 'logout'
		},
		back: function () {
			Scheduleme.Router.navigate("/", {trigger: true});
		},
		openAccountView: function () {
			Scheduleme.Router.navigate("/account", {trigger: true});
		},
		logout: function () {
			Scheduleme.helpers.handleLogout();
		}
	});

//------------------PAYLOAD----------------------------

	Scheduleme.Init = function () {

		Scheduleme.Schedules = new Scheduleme.classes.collections.Schedules();

		Scheduleme.AppView = new Scheduleme.classes.views.AppView();

		//Router takes care of this
		Scheduleme.ScheduleListView	= new Scheduleme.classes.views.ScheduleListView({collection: Scheduleme.Schedules});
		Scheduleme.ScheduleListPanelView = new Scheduleme.classes.views.ScheduleListPanelView({collection: Scheduleme.Schedules});
		Scheduleme.AccountView = new Scheduleme.classes.views.AccountView();
		Scheduleme.LoginView = new Scheduleme.classes.views.LoginView();
		//AJAX Setup
		$.ajaxSetup({
			dataType: 'json' //AJAX responses will all be treated as json dispite content-type
		});
		//Add global $.ajaxError handlers
	
		//Note that the router is started in fetchBotstrap()
		Scheduleme.helpers.fetchBootstrap();

		Handlebars.registerHelper('outputDate', Scheduleme.helpers.titleDate);

		$.mobile.defaultPageTransition = 'slide';

	    new FastClick(document.body);

	};

	$(document).ready(function () {
		Scheduleme.Init();

		$('#login-form').submit(function (e) {
			e.preventDefault();

			$.ajax({
				url: 'http://staging-shift-check.herokuapp.com/login',
				type: 'POST',
				data: $(this).serialize(),
				success: function (response) {
					//Set loading screen
					Scheduleme.helpers.fetchBootstrap();
				}, error: function (response) {
					alert('Username and password do not match. Please try again');
				}
			});	
		})
	});

//});
