$(function() {

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
	};

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
	Scheduleme.helpers.switchView = function (view) {
		if (typeof Scheduleme.CurrentView.viewType !='undefined') {
			Scheduleme.CurrentView.undelegateEvents();
		}
		Scheduleme.CurrentView = view;
		Scheduleme.CurrentView.delegateEvents();
		Scheduleme.CurrentView.render();
	};
	Scheduleme.helpers.viewSchedule = function (id) {
		var view = new Scheduleme.classes.views.ScheduleView({model: Scheduleme.Schedules.get(id)});
		//Note this needs a back button
		Scheduleme.helpers.switchView(view);
	};
	Scheduleme.helpers.fetchBootstrap = function () {
		$.ajax({
			url: '/bootstrap',
			success: function (res) {

				Scheduleme.helpers.switchView(Scheduleme.ScheduleListView);

				//Removing loading div
				$.each(res.schedules, function () {
					Scheduleme.Schedules.add(this);
				});
				//I should only have to do this once, as any other schedule add (if even possible) will be in order (I hope)
				//Other option is to reRenderTabs() at the end of addOneSchedule
				if (Scheduleme.CurrentView.viewType == 'scheduleList') {
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
			}, error: function (xhr, status, text) {
				//Remove loading div
				if (xhr.status == '403') {
					Scheduleme.helpers.switchView(Scheduleme.LoginView);
				} else  {
					console.log('An error occured: '+xhr.status);
					alert('We seem to be having some technical difficulties');
				}
			}
		});
	};
	Scheduleme.helpers.handleLogout = function () {
		//Destory session;
		//Destroy data;
		Scheduleme.helpers.switchView(Scheduleme.LoginView);
	};



	Scheduleme.classes.models.Shift = Backbone.Model.extend({

		initialize: function () {	
			console.log('adding shift: '+this.toJSON());
		}
	});
	Scheduleme.classes.collections.Shifts = Backbone.Collection.extend({

		parse: function (data) {
			return data.data;
		}
	});

	Scheduleme.classes.models.Schedule = Backbone.Model.extend({
		//url: '/api/schedules?date='+this.get('date')+'&sessionOverride=1',
		model: Scheduleme.classes.models.Shift,

		initialize: function () {
		}

	});

	Scheduleme.classes.collections.Schedules = Backbone.Collection.extend({
		url: 'api/schedules',
		model: Scheduleme.classes.models.Schedule,

		parse: function (data) {
			return data.data;
		},
		comparator: function (schedule) {
			return Date.parse(schedule.get('date'));
		}
	});

	Scheduleme.classes.views.ScheduleListView = Backbone.View.extend({
		el: $('body'),

		template: Handlebars.compile($('#list-page-template').html()),

		initialize: function () {
			this.viewType = 'scheduleList';
			//Callback incase I forget to pass reference to collection
			this.collection = typeof this.collection != 'undefined' ? this.collection : Scheduleme.Schedules;

			this.collection.bind('add',this.addOneSchedule, this);
		},

		events: {
			"click .schedule-tab" : "viewSchedule"
		},

		render: function () {
			//The JSON passed in does nothing right now, but may in the future
			$(this.el).html(this.template(JSON.stringify(Scheduleme.data)));
			this.addAllSchedules();
			return $(this.el);
		},
		addOneSchedule: function (schedule) {
			var Days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
			var Months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
			var Sups = ['th','st','nd','rd','th','th','th','th','th','th'];

			var datenum=schedule.get('date');//'2012-01-01';//This will be the real date
			var d = new Date(datenum);

			d = Scheduleme.helpers.UTCify(d);

			datenum = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+(d.getDate());
			var datestring = Days[d.getDay()]+', '+Months[d.getMonth()]+' '+(d.getDate()); //This will be the date string
			schedule.set('datenum', datenum);
			schedule.set('datestring', datestring);

			if (schedule.get('type') == 'month') {
				datestring = Months[d.getMonth()];
				schedule.set('datestring', datestring);
				this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+datestring+'</a></li>');
			} else if (schedule.get('type') == 'week') {
				var nd = Scheduleme.helpers.addDays(d, 7);
				var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
				schedule.set('ndatestring', ndatestring);
				this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
			} else if (schedule.get('type') == 'twoweek') {
				var nd = Scheduleme.helpers.addDays(d, 14);
				var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
				schedule.set('ndatestring', ndatestring);
				this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
			} else { //Defaults to daily schedule
				this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
			}
			
		},
		//Used after the view has been destroyed then created again to add back schedule views
		addAllSchedules: function () {
			var self = this;
			_.each(this.collection.models, function (schedule) {
				self.addOneSchedule(schedule);
			});
		},
		reRenderTabs: function () { //This works
			var Sups = ['th','st','nd','rd','th','th','th','th','th','th'];

			$('.schedule-tab').remove();
			_.each(this.collection.models, function(schedule) {
				var d = new Date(schedule.get('datenum'));
				//console.log('Day1: '+d);
				d = Scheduleme.helpers.fromUTC(d);
				//console.log('Day2: '+d);
				if (schedule.get('type') == 'month') {
					this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+schedule.get('datestring')+'</a></li>');
				} else if (schedule.get('type') == 'week') {
					var nd = new Date(schedule.get('ndatestring'));
					this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+schedule.get('ndatestring')+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
					delete nd;
				} else if (schedule.get('type') == 'twoweek') {
					var nd = new Date(schedule.get('ndatestring'));
					this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+schedule.get('ndatestring')+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
					delete nd;
				} else { //Defaults to daily schedule
					this.$('#dates').append('<li class="schedule-tab" data-id="'+schedule.get('id')+'"><a href="#">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
				}
				delete d; //Remove the reference to D; it can not be garbage collected
			});
		},
		viewSchedule: function (e) {
			//console.log(e.currentTarget);
			Scheduleme.helpers.viewSchedule($(e.currentTarget).attr('data-id'));
		}
	});
	Scheduleme.classes.views.ScheduleView = Backbone.View.extend({

		el: $('body'),

		template: Handlebars.compile($('#schedule-template').html()),

		render: function () {
			//$(this.el).attr('id',this.model.get('datenum'));
			$(this.el).html(this.template(this.model.toJSON()));
			return $(this.el);
		}
	})

	Scheduleme.classes.views.AccountView = Backbone.View.extend({
		el: $('body'),

		//tagName: 'div',
		//className: 'page account',

		template: Handlebars.compile($('#account-template').html()),

		initialize: function () {
			this.viewType = 'account';
			console.log('Initializing AccountView');
		},

		events: {
			"click #change-password-trigger" : "changePassword",
			"click #edit-email-trigger" : "emailMakeEdittable",
			"click #save-email-trigger" : "emailSaveChange",
		},
		render: function () {
			$(this.el).html(this.template(JSON.stringify(Scheduleme.data)));
			$('#email').val(Scheduleme.data.email);

			$('#sched-date').datepicker({
				showOtherMonths: true,
				dateFormat: 'yy-mm-dd',
				maxDate: "+0D"
			});
			$('#upload-schedule-date').datepicker({
				showOtherMonths: true,
				dateFormat: 'yy-mm-dd',
				minDate: "+0D"
			});

			return $(this.el);
		},
		changePassword: function () {
			console.log('trying to changing password...');
			function validatePasswords () {
				var newpass = $('#newpassword').val();
				var newpass1 = $('#newpassword1').val();
				if (newpass.length < 6) {
					return 3;
				}
				if (newpass != newpass1) {
					return 2;
				}
				return 1;
			}

			console.log('validating password change...');

			var validate = validatePasswords();
			if (validate == 1) {
				if ( $('#oldpassword').val() != $('#newpassword').val() ) {
					console.log('Inputs valid.');
					$.ajax({url: '/me/changePassword',
						type: 'POST',
						data: 'oldpassword='+$('#oldpassword').val()+'&newpassword='+$('#newpassword').val(),
						success: function (response) {
							alert ('Password successfully changed!');
							//Clear fields
							$('#oldpassword').val('');
							$('#newpassword').val('');
							$('#newpassword1').val('');
						}, error: function () {
							alert ('Password change failed.');
						}
					});
					console.log('after request...');
				} else {
					console.log('The new password cannot match the old password');
				}
			} else if (validate == 2) {
				console.log('The new password entries must match.');
			} else if (validate == 3) {
				console.log('Your new password must be at last 6 characters long');
			}
		},
		emailMakeEdittable: function () {
			$('#email').removeAttr('disabled');
			$('#save-email-trigger').show();
			$('#edit-email-trigger').hide();
		},
		emailSaveChange: function () {
			function validateEmail(email) {
				var re = /^(([^<>()[\\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return re.test(email);
			}
			console.log('new email: '+$('#email').val());
			if (validateEmail($('#email').val())) {
				console.log('email valid. changing email');
				$('#email').attr('disabled','');
				$('#edit-email-trigger').show();
				$('#save-email-trigger').hide();
			} else {
				console.log('the entered email is not valid');
			}
		}
	});

	Scheduleme.classes.views.LoginView = Backbone.View.extend({
		el: $('body'),

		template: Handlebars.compile($('#login-template').html()),

		events: {
			'submit #login-form' : 'handleLogin'
		},
		handleLogin: function (e) {
			console.log('test');
			e.preventDefault(); //Prevent default submission
			$.ajax({
				url: '/login',
				type: 'POST',
				data: $('#login-form').serialize(),
				success: function (response) {
					console.log('successful login');	
					Scheduleme.helpers.fetchBootstrap();
				}, error: function (response) {
					alert('Username and password do not match. Please try again');
				}
			});	
		},
		render: function () {
			//$(this.el).attr('id',this.model.get('datenum'));
			$(this.el).html(this.template());
			return $(this.el);
		}
	});
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
			Scheduleme.helpers.switchView(Scheduleme.ScheduleListView);
		},
		openAccountView: function () {
			console.log('will open AccountView here');
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
		Scheduleme.AccountView = new Scheduleme.classes.views.AccountView();
		Scheduleme.LoginView = new Scheduleme.classes.views.LoginView();
		//AJAX Setup
		$.ajaxSetup({
			dataType: 'json' //AJAX responses will all be treated as json dispite content-type
		});
		//Add global $.ajaxError handlers

		Handlebars.registerHelper('outputDate', function() {
			var t = new Date();
			var today = t.getFullYear()+'-'+(t.getMonth()+1)+'-'+(t.getDate()+1);
			var output = '';
			if (this.datenum == today) {
				return 'Today';
			} else {
				return this.datestring;
			}
		});

		Scheduleme.helpers.fetchBootstrap();
	};

	$(document).ready(function () {
		Scheduleme.Init();
	});

});
