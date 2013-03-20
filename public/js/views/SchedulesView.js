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
		"click .upload-modal-trigger" : "openUploadModel",

		"click #upload_submit" : "createUploadObject"
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

		//Hack to test D3 schedules
		//schedule.set('type', 'shifted');

		if (schedule.get('type') == 'month') {
			datestring = Months[d.getMonth()];
			schedule.set('datestring', datestring);
			this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#d'+datenum+'" data-toggle="tab">'+datestring+'</a></li>');
			var view = new Scheduleme.classes.views.ScheduleView.monthly ({model:schedule});
		} else if (schedule.get('type') == 'week') {
			var nd = Scheduleme.helpers.addDays(d, 7);
			var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
			schedule.set('ndatestring', ndatestring);
			this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#d'+datenum+'" data-toggle="tab">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+(Scheduleme.meta.mobile ? '' : '<br/>')+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
			var view = new Scheduleme.classes.views.ScheduleView.weekly ({model:schedule});
		} else if (schedule.get('type') == 'twoweek') {
			var nd = Scheduleme.helpers.addDays(d, 14);
			var ndatestring = Days[nd.getDay()]+', '+Months[nd.getMonth()]+' '+(nd.getDate()+1); //This will be the date string
			schedule.set('ndatestring', ndatestring);
			this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#d'+datenum+'" data-toggle="tab">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup> - '+(Scheduleme.meta.mobile ? '' : '<br/>')+ndatestring+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
			var view = new Scheduleme.classes.views.ScheduleView.biweekly ({model:schedule});
		} else if (schedule.get('type') == 'shifted' && Scheduleme.meta.d3) {
			this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#d'+datenum+'" data-toggle="tab">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
			var view = new Scheduleme.classes.views.ScheduleView.d3 ({model:schedule});
		} else if (typeof schedule.get('csv') != 'undefined') {
			this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#d'+datenum+'" data-toggle="tab">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
			var view = new Scheduleme.classes.views.ScheduleView.table ({model:schedule});
		} else { //Defaults to daily schedule
			this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#d'+datenum+'" data-toggle="tab">'+datestring+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
			var view = new Scheduleme.classes.views.ScheduleView.daily ({model:schedule});
		}

		this.$('.tab-content').append(view.render());

		if ( schedule.get('type') == 'shifted' && Scheduleme.meta.d3 ) {
			view.postRender();
		}

		//Rerender tabs
		
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
				this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#d'+schedule.get('datenum')+'" data-toggle="tab">'+schedule.get('datestring')+'</a></li>');
			} else if (schedule.get('type') == 'week') {
				var nd = new Date(schedule.get('ndatestring'));
				this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#d'+schedule.get('datenum')+'" data-toggle="tab">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+schedule.get('ndatestring')+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
				delete nd;
			} else if (schedule.get('type') == 'twoweek') {
				var nd = new Date(schedule.get('ndatestring'));
				this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#d'+schedule.get('datenum')+'" data-toggle="tab">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup> - <br/>'+schedule.get('ndatestring')+'<sup>'+Sups[nd.getDate()%10]+'</sup></a></li>');
				delete nd;
			} else { //Defaults to daily schedule
				this.$('#dates.nav-tabs #prependHere').before('<li class="schedule-tab"><a href="#d'+schedule.get('datenum')+'" data-toggle="tab">'+schedule.get('datestring')+'<sup>'+Sups[d.getDate()%10]+'</sup></a></li>');
			}
			delete d; //Remove the reference to D; it can not be garbage collected
		});
	},

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
	loadByDate: function (date) {
		var dstring = $('#sched-date').val();

		if (dstring == '') { //date is only used when a new schedule has just been uploaded
			dstring = date;
		}

		if (typeof dstring != 'undefined' && dstring != '') {
			console.log('loading by date');
			console.log('Date: '+dstring);

			$.ajax({
				url: '/schedules/'+dstring,
				type: 'get',
				success: function (response) {
					console.log('adding schedule date: '+dstring);
					Scheduleme.Schedules.add(response.data);

					Scheduleme.CurrentView.reRenderTabs();

					//I should actually click the new one... i'll have to figure out how to do that
					  // If I can click the one with the id of the date (dstring)
					  // Unfortunately the dstring always has MM month, whereas the id will not. If I remove the 0s from month/day it should work
					$('#dates.nav.nav-tabs li:nth-child(2) a').click();

				}, error: function (xhr) {
					console.log('DENIED!!');
				}, complete: function () {
					$('#sched-date').val('');
				}
			});
		}
	},
	openUploadModel: function () {
		$('#upload-modal').modal('show');
	},

	createUploadObject: function ( event ) {

		event.preventDefault();
		$('.modal-footer button').attr('disabled', true);
		$('#ajax-loader').removeClass('hidden');
		//This works (delegating the task to the helper object)
		obj = new uploadObject();
		obj.setCallback(function () {
			$('.modal-footer button').attr('disabled', false);
			$('#ajax-loader').addClass('hidden');
		});
		obj.requestCredentials();
	}
});