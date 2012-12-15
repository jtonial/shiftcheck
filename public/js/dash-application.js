$(function() {

	window.Scheduleme = {//new Object();
		classes: {
			models: {},
			collections: {},
			views: {},
		},
		helpers: {},

		Schedules: {},
		SchedulesView: {},

		Init: function () {},

		AppView: {},
		Router: {},
	};

	/*Scheduleme.classes.models.Shift = Backbone.Model.extend({

		initialize: function () {	
			console.log('adding shift: '+this.toJSON());
		}
	});
	Scheduleme.classes.collections.Shifts = Backbone.Collection.extend({

		parse: function (data) {
			return data.data;
		}
	});*/

	Scheduleme.classes.models.Schedule = Backbone.Model.extend({
		//url: '/api/schedules?date='+this.get('date')+'&sessionOverride=1',
		//model: Scheduleme.classes.models.Shift,

		initialize: function () {
			//this.shifts = new Scheduleme.classes.collections.Shifts();
			//this.shifts.url='/api/schedules?date='+this.get('date')+'&sessionOverride=1';

			/*var that = this;
			$.each(this.get('shifts'), function (index, shift) {
				console.log('adding shift: '+index);
				that.shifts.add({model: shift});
				//that.shifts.add(new Scheduleme.classes.model.Shift({model:shift});
			});*/

		}

	});

	Scheduleme.classes.collections.Schedules = Backbone.Collection.extend({
		url: 'api/schedules',
		model: Scheduleme.classes.models.Schedule,

		parse: function (data) {
			return data.data;
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
			var tmp = this.template(this.model.toJSON());
			console.log('LOG:::: '+tmp);
			$(this.el).html(tmp);
			return $(this.el);
		}

	});
	Scheduleme.classes.views.SchedulesView = Backbone.View.extend({
		el: $('.page.schedules'),

		initialize: function () {
			//this.collection = typeof
			this.collection.bind('add',this.addOneSchedule, this);
		},

		//Adds one schedule to the Schedules page.
		addOneSchedule: function (schedule) {

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
			this.$('#dates.nav-tabs').append('<li><a href="#'+datenum+'" data-toggle="tab">'+datestring+'<sup>'+Sups[(d.getDate()+1)%10]+'</sup></a></li>');

			var view = new Scheduleme.classes.views.ScheduleView ({model:schedule, datenum: datenum});

			this.$('.tab-content').append(view.render());
			//this.$('.tab-content').append('<div id="'+datenum+'" class="tab-pane"></div>');
			
		},
	});

	//-------------------------------ROUTER------------------------------------
	window.AppRouter = Backbone.Router.extend({

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
			//'schedules':'schedules',
			//'exchanges':'exchanges',
			//'approvals':'approvals',
			//'account':'account',

			'':'schedules'
		},

		schedules: function () {
			$('.link, .page').removeClass('active');
			$('.schedules').addClass('active');
		},
		employees: function() {
			$('.link, .page').removeClass('active');
			$('.employees').addClass('active');
		},
		exchanges: function () {
			$('.link, .page').removeClass('active');
			$('.exchanges').addClass('active');
		},
		account: function () {
			$('.link, .page').removeClass('active');
			$('.account').addClass('active');
		}
	});
//------------------PAYLOAD----------------------------

	Scheduleme.Schedules = new Scheduleme.classes.collections.Schedules();
	Scheduleme.SchedulesView = new Scheduleme.classes.views.SchedulesView({collection: Scheduleme.Schedules});

	Scheduleme.Router = new AppRouter;
	Backbone.history.start();

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

	Scheduleme.Schedules.add({"date":"2012-12-18T00:00:00.000Z","creation_time":"2012-12-15T07:22:41.971Z","url":"12BarzTickets.pdf"});
	Scheduleme.Schedules.add({"date":"2012-12-19T00:00:00.000Z","creation_time":"2012-12-15T07:22:41.971Z","url":"12BarzTickets.pdf"});
});
