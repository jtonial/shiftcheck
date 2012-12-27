$(function() {

	window.Scheduleme = {//new Object();
		classes: {
			models: {},
			collections: {},
			views: {},
		},
		helpers: {},

		data: {},

		Schedules: {},

		//By keeping the views and just undelegatingEvents on switch, with currentView
			//pointing to the active one
		SchedulesView: {},
		EmployeesView: {},
		ApprovalsView: {},
		AccountView: {},

		Init: function () {},

		CurrentView: {},
		Router: {},
	};
	Scheduleme.classes.models.Employee = Backbone.Model.extend({
		
	});

	Scheduleme.classes.collections.Employees = Backbone.Collection.extend({
	
		//url:,
		
		model: Scheduleme.classes.models.Employee,

	});

	Scheduleme.classes.views.EmployeeView = Backbone.View.extend({

		tagName: 'div',
		template: _.template($('#employee-template').html()),
		render: function () {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		}
	});

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
		/*	this.shifts = new Scheduleme.classes.collections.Shifts();
			this.shifts.url='/api/schedules?date='+this.get('date')+'&sessionOverride=1';

			var that = this;
			$.each(this.get('shifts'), function (index, shift) {
				console.log('adding shift: '+index);
				that.shifts.add({model: shift});
				//that.shifts.add(new Scheduleme.classes.model.Shift({model:shift});
			});
		*/
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

	/*Scheduleme.classes.views.ShiftView = Backbone.View.extend({

		tagName: 'div',

		template: _.template($('#shift-template').html()),

		events: {
			"click .edit" : "toggleEditOn",
			"click .save" : "saveChanges"
		},

		toggleEditOn: function () {
			$('.btn.edit').addClass('hidden');
			$('.btn.save').removeClass('hidden');
		},
		saveChanges: function () {
			$('.btn.edit').removeClass('hidden');
			$('.btn.save').addClass('hidden');
			console.log('saving...');
		},
		render: function () {
			$(this.el).html(this.template(this.model.toJSON()));
			this.$('.shift-slider').slider({
				range: true,
				min: 6,
				max: 30,
				values: [ 8, 12 ], //values: [this.model.get('start_time'), this.model.get('end_time')],
				step: 0.25
			});
			return this;
		}
	});*/

	Scheduleme.classes.views.ScheduleView = Backbone.View.extend({
		
		//Create the frame
		//After MVP
		/*initialize: function () {
			var that=this;
			this._shiftViews = [];

			if (typeof this.collection != 'undefined') {
				this.collection.each(function(shift) {
					that._shiftViews.push(new ShiftView ({model: shift}));
				});
			}
		},*/

		template: Handlebars.compile($('#schedule-template').html()),
		
		className: 'tab-pane',

		//Create the frame
		initialize: function () {
			var that=this;
			//this._shiftViews = [];

			//if (typeof this.collection != 'undefined') {
			//	this.collection.each(function(shift) {
			//		that._shiftViews.push(new ShiftView ({model: shift}));
			//	});
			//}
		},

		//Add in views for each shift in the schedule
		render: function () {
			$(this.el).attr('id',this.model.get('datenum'));
			$(this.el).html(this.template(this.model.toJSON()));
			return $(this.el);
		}

	});

	Scheduleme.classes.views.SchedulesView = Backbone.View.extend({
		//This renders directly into the el element; no need to append
			//Replaces everything in it; and no need to postRender()
		el: $('#content'),


		template: Handlebars.compile($('#schedules-template').html()),

		initialize: function () {
			this.viewType = 'schedules';
			//Callback incase I forget to pass reference to collection
			this.collection = typeof this.collection != 'undefined' ? this.collection : Scheduleme.Schedules;

			this.collection.bind('add',this.addOneSchedule, this);
		},

		events: {
			"change #sched-date" : "loadByDate",
			"click .upload-modal-trigger" : "openUploadModel"
		},
		render: function () {
			//The JSON passed in does nothing right now, but may in the future
			$(this.el).html(this.template(JSON.stringify(Scheduleme.data)));
			this.postRender();

			return $(this.el);
		},
		postRender: function () {
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

			this.addAllSchedules();
			//Select first schedule
			$('#dates.nav.nav-tabs li:nth-child(2) a').click();
		},
		//Adds one schedule to the Schedules page.
		addOneSchedule: function (schedule) {
			console.log('adding schedule');
			var Days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
			var Months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
			var Sups = ['th','st','nd','rd','th','th','th','th','th','th'];

			var datenum=schedule.get('date');//'2012-01-01';//This will be the real date
			var d = new Date(datenum);
			datenum = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+(d.getDate()+1);
			var datestring = Days[d.getDay()]+', '+Months[d.getMonth()]+' '+(d.getDate()+1); //This will be the date string
			schedule.set('datenum', datenum);
			schedule.set('datestring', datestring);
			//var test = d.getDate()+1; console.log('Date: '+test+'; %10: '+test%10+'; sup: '+Sups[test%10]);
			this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#'+datenum+'" data-toggle="tab">'+datestring+'<sup>'+Sups[(d.getDate()+1)%10]+'</sup></a></li>');

			var view = new Scheduleme.classes.views.ScheduleView ({model:schedule});

			this.$('.tab-content').append(view.render());
			//this.$('.tab-content').append('<div class="tab-pane" id="'+datenum+'"></div>');
			
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
				this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#'+schedule.get('datenum')+'" data-toggle="tab">'+schedule.get('datestring')+'<sup>'+Sups[(d.getDate()+1)%10]+'</sup></a></li>');
				delete d; //Remove the reference to D; it can not be garbage collected
			});
		},
		/*
			This should work, but hasn't had final testing.
			I don't know if it's really necessary to rerender the schedules when
			keeping the tabs in order, so I'm leaving this for now.
		*/
		reRenderCollection: function () {
			//Actually I dont have to re-render the views... I only really have to re-render the tabs
			console.log('rerendering....');
			//Clear all views (remove/undelegateEvents)
			/*_.each(this.views, function (view){
				console.log('removing view');
				view.remove();
				delete view; //Clear reference
			});
			this.views = Array(); //Reset array;

			this.addAllSchedules();*/
		},
		loadByDate: function () {
			var dstring = $('#sched-date').val();
			if (typeof dstring != 'undefined' && dstring != '') {
				console.log('loading by date');
				console.log('Date: '+dstring);

				$.ajax({
					url: '/schedules/'+dstring,
					type: 'get',
					success: function (response) {
						console.log('adding schedule date: '+dstring);
						Scheduleme.Schedules.add(response.data);
					}, error: function (xhr) {
						console.log('DENIED!!');
					}
				});
			}
		},
		openUploadModel: function () {
			$('#upload-modal').modal('show');
		}
	});

	Scheduleme.classes.views.AccountView = Backbone.View.extend({
		el: $('#content'),

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
			"click #save-email-trigger" : "emailSaveChange"
		},
		render: function () {
			$(this.el).html(this.template(JSON.stringify(Scheduleme.data)));
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

	Scheduleme.classes.models.Approval = Backbone.Model.extend({
	
	});

	Scheduleme.classes.collections.Approvals = Backbone.Collection.extend({
		//url:,
		model: Scheduleme.classes.models.Shift,
	});

	Scheduleme.classes.views.ApprovalView = Backbone.View.extend({

		tagName: 'div',
		template: _.template($('#approval-template').html()),
		render: function () {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		}
	});
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
			//'schedules':'schedules',
			//'employees':'employees',
			//'exchanges':'exchanges',
			//'approvals':'approvals',
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
			console.log('Opening SchedulesView')
			this.switchView(Scheduleme.SchedulesView);
			/*if (typeof Scheduleme.CurrentView.viewType !='undefined') {
				Scheduleme.CurrentView.undelegateEvents();
			}
			Scheduleme.CurrentView = Scheduleme.SchedulesView;
			Scheduleme.CurrentView.delegateEvents();
			Scheduleme.CurrentView.render();*/
		},/*,
		employees: function() {
			$('.link, .page').removeClass('active');
			$('.employees').addClass('active');
		},
		exchanges: function () {
			$('.link, .page').removeClass('active');
			$('.exchanges').addClass('active');
		},
		approvals: function () {
			$('.link, .page').removeClass('active');
			$('.approvals').addClass('active');
		},*/
		account: function () {
			console.log('Opening AccountView');
			this.switchView(Scheduleme.AccountView);
			/*if (typeof Scheduleme.CurrentView.viewType !='undefined') {
				Scheduleme.CurrentView.undelegateEvents();
			}
			Scheduleme.CurrentView = Scheduleme.AccountView;
			Scheduleme.CurrentView.delegateEvents();
			Scheduleme.CurrentView.render();*/
		}
	});
//------------------PAYLOAD----------------------------

	Scheduleme.Init = function () {
		Scheduleme.Schedules = new Scheduleme.classes.collections.Schedules();

		//Router takes care of this
		Scheduleme.SchedulesView = new Scheduleme.classes.views.SchedulesView({collection: Scheduleme.Schedules});
		Scheduleme.AccountView = new Scheduleme.classes.views.AccountView();

		//console.log('Rendering View');
		//Scheduleme.CurrentView.render();

		Scheduleme.Router = new AppRouter;
		//Note: I'm not using pushState right now because I dont want to have to deal with making the server-side be
			//able to handle it.
		Backbone.history.start({
			//pushState: true,
			//root: '/'
		});
		//configPushState();

		$.ajax({
			url: '/bootstrap',
			success: function (res) {
				//Removing loading div
				$.each(res.schedules, function () {
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

});
