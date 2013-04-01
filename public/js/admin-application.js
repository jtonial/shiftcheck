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
		var nd = new Date(date);

		nd.setDate(date.getDate() + adding);
		return nd;
	};


	//------------------PAYLOAD----------------------------

	Scheduleme.Init = function () {
		Scheduleme.Schedules = new Scheduleme.classes.collections.Schedules();

		//Router takes care of this
		//Scheduleme.SchedulesView = new Scheduleme.classes.views.SchedulesView({ collection: Scheduleme.Schedules });
		Scheduleme.AccountView = new Scheduleme.classes.views.AccountView();

		Scheduleme.ScheduleListView = new Scheduleme.classes.views.ScheduleListView({ collection: Scheduleme.Schedules });

		//AJAX Setup
		$.ajaxSetup({
			dataType: 'json' //AJAX responses will all be treated as json dispite content-type
		});
		//Add global $.ajaxError handlers

		$('#toggle-sidebar-trigger').click( function () {
			console.log('toggling sidebar state');
			var newState = $('#sidebar').hasClass('closed') ? 'open' : 'closed';
			$('#sidebar').removeClass('open closed').addClass(newState);
		});

		$.ajax({
			url: '/bootstrap',
			success: function (res) {
				//Removing loading div

				$.each(res.data.schedules, function () {
					Scheduleme.Schedules.add(this);
				});

				Scheduleme.ScheduleListView.reRenderTabs();

				$('#schedule-pane').removeClass('loading');

				if (!res.data.schedules.length) {
					$('#schedule-pane').addClass('no-schedules');
				} else {
					$('#schedule-pane').addClass('select-schedule');
				}

				
				// Instead of the prompt to select a schedule, I could auto select the first one

				//	Scheduleme.CurrentView.reRenderTabs();
				//	$('#dates.nav.nav-tabs li:nth-child(2) a').click();

				//Add data into global object
				Scheduleme.data.email = res.data.email;
				if (Scheduleme.CurrentView.viewType !='undefined') {
					$('#email').val(Scheduleme.data.email);
				}
				Scheduleme.data.name = res.data.name;
				Scheduleme.data.username = res.data.username;
			}, error: function () {
				//Remove loading div
				$('#schedule-pane').removeClass('loading').addClass('loading-error');

				console.log('An error occured');
				//alert('We seem to be having some technical difficulties');
			}, complete: function () {
				Scheduleme.Router = new AppRouter;

				Backbone.history.start({
					pushState: true,
					root: '/'
				});
				//configPushState();
			}
		});

	//This is here because I currently do not have a global view. If I do, it will be there
	$('#logout-trigger').click( function () {
		window.location.href = '/logout';
	})

	};

	$(document).ready(function () {
		Scheduleme.Init();
	});

//});