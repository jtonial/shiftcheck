$(function() {

	window.Employee = Backbone.Model.extend({
		
	});

	window.Employees = Backbone.Collection.extend({
	
		//url:,
		
		model: Employee,

	});

	window.EmployeeView = Backbone.View.extend({

		tagName: 'div',
		template: _.template($('#employee-template').html()),
		render: function () {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		}
	});

	window.Shift = Backbone.Model.extend({
	
	});
	window.Shifts = Backbone.Collection.extend({

		parse: function (data) {
			return data.data;
		}
	});

	window.Schedule = Backbone.Model.extend({
		//url: '/api/schedules?date='+this.get('date')+'&sessionOverride=1',
		model: Shift,

		initialize: function () {
			this.shifts = new Shifts();
			this.shifts.url='/api/schedules?date='+this.get('date')+'&sessionOverride=1';
		}

	});

	window.Schedules = Backbone.Collection.extend({
		url: 'api/schedules',
		model: Schedule,
	});

	window.ShiftView = Backbone.View.extend({

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
	});

	window.ScheduleView = Backbone.View.extend({

		//Create the frame
		initialize: function () {
			var that=this;
			this._shiftViews = [];

			this.collection.each(function(shift) {
				that._shiftViews.push(new ShiftView ({model: shift}));
			});
		},
		//Add in views for each shift in the schedule

	});
	window.SchedulesView = Backbone.View.extend({
		el: $('.page.schedules'),

		initialize: function () {
			this.collection = typeof
			this.collection.bind('add',this.addOneSchedule, this);
		},

		//Adds one schedule to the Schedules page.
		addOneSchedule: function (schedule) {
			var datenum='2012-01-01';//This will be the real date
			var datestring = 'Day Goes Here'; //This will be the date string
			this.$('#dates.nav-tabs div').before('<li><a href="#'+datenum+'" data-toggle="tab">'+datestring+'</a></li>');

			this.$('.tab-content').append('<div class="tab-pane" id="'+datenum+'"></div>');
			
		},
	});

	window.Approval = Backbone.Model.extend({
	
	});

	window.Approvals = Backbone.Collection.extend({
		//url:,
		model: Shift,
	});

	window.ApprovalView = Backbone.View.extend({

		tagName: 'div',
		template: _.template($('#approval-template').html()),
		render: function () {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		}
	});
	//-------------------------------ROUTER------------------------------------
	window.AppRouter = Backbone.Router.extend({
		init:0,
	
		initialize: function() {
			//return this.bind('all', this._trackPageview);
		},
		/*_trackPageview: function() {
			var url;
			url = Backbone.history.getFragment();
			//alert('tracking...: '+url);
//			if (this.currentMain != url ) {
				return _gaq.push(['_trackPageview',"/" + url]);
	//		}
		},*/
		routes: {
			'schedules':'schedules',
			'employees':'employees',
			'upforgrabs':'upforgrabs',
			'approvals':'approvals',
			'account':'account',

			//'*something':'shifts'
		},

		schedules: function () {
			$('.link, .page').removeClass('active');
			$('.schedules').addClass('active');
		},
		employees: function() {
			$('.link, .page').removeClass('active');
			$('.employees').addClass('active');
		},
		upforgrabs: function () {
			$('.link, .page').removeClass('active');
			$('.upforgrabs').addClass('active');
		},
		approvals: function () {
			$('.link, .page').removeClass('active');
			$('.approvals').addClass('active');
		},
		account: function () {
			$('.link, .page').removeClass('active');
			$('.account').addClass('active');
		}
	});
//------------------PAYLOAD----------------------------

		window.Schedules = new Schedules();
		window.SchedulesView = new SchedulesView({collection: Schedules});

		var Router = new AppRouter;
		Router.init=1;
		Backbone.history.start();

});
